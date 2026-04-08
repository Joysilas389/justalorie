# 🍽️ Justalorie

**Personal Calorie Management Web App for the Ghanaian Context**

Justalorie is a full-stack calorie management application built specifically for Ghanaian food habits. It helps users track food intake with local Ghanaian foods, calculate exact calorie values, monitor weight, steps, fasting schedules, and heart rate in real time.

---

## Features

- **Ghanaian Food Database** — 65+ seeded local dishes, fruits, vegetables, snacks, canned foods, bottled drinks, malt drinks, and bread with accurate calorie data
- **Smart Calorie Engine** — Calculates exact calories from quantity, unit, serving type, container, and slices
- **Daily Food Logging** — Log meals with meal type, mood, hunger, and energy notes
- **TDEE/BMR Calculator** — Personalized daily calorie targets based on your body and goals
- **Portion Reduction/Addition Engine** — Suggests exact foods to cut or add for weight management
- **Food Substitution Engine** — Proposes lower-calorie Ghanaian alternatives
- **Intermittent Fasting Tracker** — Dynamic schedules (12:12 to 20:4) with live progress
- **Steps Tracker** — Manual step entry with daily totals and charts
- **Weight Tracker** — Trend analysis with gain/loss insights
- **Real-Time Heart Rate Tracker** — WebSocket-powered live BPM plotting with session management and simulation mode
- **Analytics Dashboard** — Calorie trends, weight, steps, fasting, meal timing, and heart rate charts with 7/30/90-day filters
- **Smart Tools** — BMI calculator, recipe builder, portion helpers, unit converter
- **Dark/Light Mode** — Full theme support persisted in localStorage
- **Mobile-First Design** — Bottom navigation on mobile, sidebar on desktop, responsive everywhere
- **Custom Food CRUD** — Add, edit, delete your own foods with package and slice support
- **Delete Confirmations** — Modal confirmation for all destructive actions
- **PWA-Ready** — Manifest, favicon, installable structure

---

## Architecture

```
justalorie/
├── client/                  # React + Vite frontend
│   ├── public/              # Static assets, manifest
│   └── src/
│       ├── App.jsx          # Router + providers
│       ├── main.jsx         # Entry point
│       ├── components/      # Reusable UI components
│       │   ├── charts/      # ApexCharts wrappers
│       │   ├── common/      # ConfirmModal, etc.
│       │   └── dashboard/   # CalorieRing, etc.
│       ├── constants/       # App constants
│       ├── context/         # ThemeContext, ToastContext
│       ├── hooks/           # useFetch, useHeartRateWs
│       ├── layouts/         # AppLayout with sidebar/bottom nav
│       ├── pages/           # All page components
│       ├── services/        # Axios API client
│       ├── styles/          # Custom CSS
│       └── utils/           # Formatting helpers
│
├── server/                  # Node.js + Express backend
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema (14 models)
│   │   └── seed.js          # Ghanaian food seed data
│   └── src/
│       ├── app.js           # Express app setup
│       ├── server.js        # HTTP + WebSocket server
│       ├── config/          # Environment config
│       ├── routes/          # All REST API routes
│       ├── middleware/       # Error handling, validation
│       ├── realtime/        # WebSocket heart rate streaming
│       └── utils/           # Prisma client, calorie engine, helpers
│
└── README.md
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Bootstrap 5, Bootstrap Icons, ApexCharts, Axios, Day.js |
| Backend | Node.js, Express, Prisma ORM, WebSocket (ws) |
| Database | PostgreSQL |
| Deployment | Vercel (frontend), Render (backend + Postgres) |

---

## Database Schema

14 models including: FoodCategory, FoodItem, FoodServingOption, FoodLog, WeightLog, StepLog, FastingLog, HeartRateSession, HeartRateLog, UserProfileLocal, AppSetting, Recipe, RecipeIngredient.

FoodItem supports: caloriesPer100g, caloriesPerUnit, caloriesPerSlice, packageType (CAN/BOTTLE/TIN/LOAF), packageWeightG, packageVolumeMl, slicesPerLoaf, confidenceLevel (VERIFIED/ESTIMATED/USER_ADDED), preparation type, and macros.

---

## API Endpoints

All endpoints return `{ success: boolean, message: string, data: any }`.

- `GET/POST/PUT/DELETE /api/foods` — Food CRUD
- `GET /api/categories` — Food categories
- `GET/POST/PUT/DELETE /api/logs/food` — Food log CRUD
- `GET/POST/PUT/DELETE /api/logs/steps` — Step logs
- `GET/POST/DELETE /api/logs/weight` — Weight logs
- `GET/POST/PUT/DELETE /api/logs/fasting` — Fasting logs
- `GET/POST /api/logs/heart-rate` — Heart rate readings
- `GET/POST /api/heart-rate/sessions` — HR sessions
- `PUT /api/heart-rate/sessions/:id/stop` — Stop session
- `GET /api/heart-rate/live` — Live session data
- `WS /ws/heart-rate` — WebSocket real-time stream
- `GET/PUT /api/profile` — User profile
- `GET/PUT /api/settings` — App settings
- `POST /api/calculator/tdee` — TDEE calculation
- `POST /api/tools/portion-reduction` — Reduction suggestions
- `POST /api/tools/portion-addition` — Addition suggestions
- `POST /api/tools/substitutions` — Food substitutes
- `POST /api/tools/recipe-calculate` — Recipe calorie calc
- `GET /api/dashboard/summary` — Dashboard rollup
- `GET /api/analytics/overview|trends|meal-timing|fasting-insights|heart-rate` — Analytics

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or use Render Postgres)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/justalorie.git
cd justalorie
```

### 2. Backend setup

```bash
cd server
cp .env.example .env
# Edit .env with your PostgreSQL connection string:
# DATABASE_URL="postgresql://user:password@localhost:5432/justalorie?schema=public"
# CORS_ORIGIN=http://localhost:5173

npm install
npx prisma generate
npx prisma db push       # or: npx prisma migrate dev --name init
node prisma/seed.js       # Seed Ghanaian food data
npm run dev               # Starts on port 5000
```

### 3. Frontend setup

```bash
cd ../client
cp .env.example .env
# Default .env is fine for local dev (API proxied via Vite)

npm install
npm run dev               # Starts on port 5173
```

### 4. Open the app

Visit `http://localhost:5173` in your browser.

---

## Environment Variables

### Server (.env)
```
DATABASE_URL=postgresql://user:password@host:5432/justalorie?schema=public
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Client (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_BASE_URL=ws://localhost:5000
```

For production, set `VITE_API_BASE_URL` to your Render backend URL (e.g., `https://justalorie-api.onrender.com/api`).

---

## Deployment

### Deploy Backend to Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repo
3. **Root Directory**: `server`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. Add environment variables:
   - `DATABASE_URL` — from your Render Postgres instance
   - `CORS_ORIGIN` — your Vercel URL (e.g., `https://justalorie.vercel.app`)
   - `NODE_ENV` — `production`
7. Create a Render PostgreSQL database and copy the Internal Database URL

**Run migration on Render:**
In Render Shell or via the build command, add:
```
npx prisma migrate deploy && node prisma/seed.js
```
Or set build command to: `npm install && npx prisma generate && npx prisma db push && node prisma/seed.js`

### Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. **Root Directory**: `client`
4. **Framework Preset**: Vite
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. Add environment variable:
   - `VITE_API_BASE_URL` = `https://YOUR-RENDER-APP.onrender.com/api`
   - `VITE_WS_BASE_URL` = `wss://YOUR-RENDER-APP.onrender.com`
8. Deploy

---

## Phone / Termux / GitHub Workflow

If you're deploying from an Android phone using Termux:

### 1. Install Termux dependencies

```bash
pkg update && pkg upgrade
pkg install git nodejs
```

### 2. Setup project

```bash
cd ~
# Copy/download the justalorie folder to your phone
# Or clone from GitHub if already pushed
```

### 3. Initialize Git and push to GitHub

```bash
cd ~/justalorie
git init
git add .
git commit -m "initial commit"
git branch -M main

# Create a new repo on GitHub.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/justalorie.git
git push -u origin main
```

### 4. Connect to Render

1. Go to render.com on your phone browser
2. Create a new PostgreSQL database → copy the connection URL
3. Create a new Web Service → connect your GitHub repo
4. Set root directory to `server`
5. Set build command: `npm install && npx prisma generate && npx prisma db push && node prisma/seed.js`
6. Set start command: `npm start`
7. Add env vars: `DATABASE_URL`, `CORS_ORIGIN`, `NODE_ENV=production`

### 5. Connect to Vercel

1. Go to vercel.com on your phone browser
2. Import your GitHub repo
3. Set root directory to `client`
4. Add env var: `VITE_API_BASE_URL` = your Render URL + `/api`
5. Deploy

### 6. Redeploying after updates

```bash
cd ~/justalorie
git add .
git commit -m "update: description"
git push
```

Both Render and Vercel will auto-redeploy from the push.

### Optional: Vercel CLI from Termux

```bash
npm install -g vercel
cd ~/justalorie/client
vercel --prod
```

---

## Troubleshooting

| Issue | Solution |
|-------|---------|
| CORS errors | Ensure `CORS_ORIGIN` in server .env matches your frontend URL exactly |
| Database connection failed | Check `DATABASE_URL` format and that Postgres is running |
| Prisma client not generated | Run `npx prisma generate` before starting server |
| Empty food database | Run `node prisma/seed.js` to seed data |
| WebSocket not connecting | Ensure `VITE_WS_BASE_URL` uses `wss://` in production |
| Charts not rendering | Check that ApexCharts is installed: `npm install apexcharts react-apexcharts` |
| Theme flickers on load | The inline script in index.html should prevent this — verify it's present |
| Heart rate simulation | Click "Simulate" during an active session — this is for development/demo |

---

## Future Improvements

- Native device heart rate sensor integration (Web Bluetooth API)
- Barcode scanner for packaged foods
- Photo-based food recognition
- Social sharing of progress
- Multi-language support (Twi, Ga, Ewe)
- Offline support with service worker
- Push notifications for fasting reminders
- Data export (CSV/PDF)
- Recipe sharing community
- Integration with fitness wearables
- Budget-aware meal planning with local market prices
- Calorie density warnings on high-density foods
- Weekly/monthly email summaries

---

## License

MIT — Built with ❤️ for Ghana 🇬🇭
