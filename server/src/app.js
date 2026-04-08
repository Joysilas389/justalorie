const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route imports
const categoryRoutes = require('./routes/categoryRoutes');
const foodRoutes = require('./routes/foodRoutes');
const foodLogRoutes = require('./routes/foodLogRoutes');
const stepLogRoutes = require('./routes/stepLogRoutes');
const weightLogRoutes = require('./routes/weightLogRoutes');
const fastingLogRoutes = require('./routes/fastingLogRoutes');
const heartRateRoutes = require('./routes/heartRateRoutes');
const profileRoutes = require('./routes/profileRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const calculatorRoutes = require('./routes/calculatorRoutes');
const toolRoutes = require('./routes/toolRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const waterLogRoutes = require('./routes/waterLogRoutes');
const sleepLogRoutes = require('./routes/sleepLogRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
if (config.nodeEnv !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ─── Health check ───────────────────────────────────────────────────────────
const healthCheck = (req, res) => {
  res.json({ success: true, message: 'Justalorie API is running', timestamp: new Date().toISOString() });
};
app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/categories', categoryRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/logs/food', foodLogRoutes);
app.use('/api/logs/steps', stepLogRoutes);
app.use('/api/logs/weight', weightLogRoutes);
app.use('/api/logs/fasting', fastingLogRoutes);
app.use('/api/logs/heart-rate', heartRateRoutes);
app.use('/api/heart-rate', heartRateRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/logs/water', waterLogRoutes);
app.use('/api/logs/sleep', sleepLogRoutes);
app.use('/api/reports', reportRoutes);

// ─── Error handling ─────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
