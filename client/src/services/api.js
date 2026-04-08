import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Response interceptor to extract data
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Network error';
    return Promise.reject({ message, errors: err.response?.data?.errors || [], status: err.response?.status });
  }
);

// ─── Categories ──────────────────────────────────────────────────────────────
export const getCategories = () => api.get('/categories');

// ─── Foods ───────────────────────────────────────────────────────────────────
export const getFoods = (params) => api.get('/foods', { params });
export const getFood = (id) => api.get(`/foods/${id}`);
export const createFood = (data) => api.post('/foods', data);
export const updateFood = (id, data) => api.put(`/foods/${id}`, data);
export const deleteFood = (id) => api.delete(`/foods/${id}`);

// ─── Food Logs ───────────────────────────────────────────────────────────────
export const getFoodLogs = (params) => api.get('/logs/food', { params });
export const createFoodLog = (data) => api.post('/logs/food', data);
export const updateFoodLog = (id, data) => api.put(`/logs/food/${id}`, data);
export const deleteFoodLog = (id) => api.delete(`/logs/food/${id}`);

// ─── Steps ───────────────────────────────────────────────────────────────────
export const getStepLogs = (params) => api.get('/logs/steps', { params });
export const createStepLog = (data) => api.post('/logs/steps', data);
export const updateStepLog = (id, data) => api.put(`/logs/steps/${id}`, data);
export const deleteStepLog = (id) => api.delete(`/logs/steps/${id}`);

// ─── Weight ──────────────────────────────────────────────────────────────────
export const getWeightLogs = (params) => api.get('/logs/weight', { params });
export const createWeightLog = (data) => api.post('/logs/weight', data);
export const deleteWeightLog = (id) => api.delete(`/logs/weight/${id}`);

// ─── Fasting ─────────────────────────────────────────────────────────────────
export const getFastingLogs = (params) => api.get('/logs/fasting', { params });
export const startFast = (data) => api.post('/logs/fasting', data);
export const updateFastingLog = (id, data) => api.put(`/logs/fasting/${id}`, data);
export const deleteFastingLog = (id) => api.delete(`/logs/fasting/${id}`);

// ─── Heart Rate ──────────────────────────────────────────────────────────────
export const getHeartRateLogs = (params) => api.get('/logs/heart-rate', { params });
export const logHeartRate = (data) => api.post('/logs/heart-rate', data);
export const getHeartRateSessions = (params) => api.get('/heart-rate/sessions', { params });
export const startHeartRateSession = (data) => api.post('/heart-rate/sessions', data);
export const stopHeartRateSession = (id) => api.put(`/heart-rate/sessions/${id}/stop`);
export const getLiveHeartRate = () => api.get('/heart-rate/live');

// ─── Profile ─────────────────────────────────────────────────────────────────
export const getProfile = () => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);

// ─── Settings ────────────────────────────────────────────────────────────────
export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);
export const cleanupDuplicates = () => api.post('/settings/cleanup-duplicates');

// ─── Calculator / Tools ─────────────────────────────────────────────────────
export const calculateTDEE = (data) => api.post('/calculator/tdee', data);
export const getPortionReduction = (data) => api.post('/tools/portion-reduction', data);
export const getPortionAddition = (data) => api.post('/tools/portion-addition', data);
export const getSubstitutions = (data) => api.post('/tools/substitutions', data);
export const calculateRecipe = (data) => api.post('/tools/recipe-calculate', data);

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const getDashboardSummary = () => api.get('/dashboard/summary');

// ─── Analytics ───────────────────────────────────────────────────────────────
export const getAnalyticsOverview = (params) => api.get('/analytics/overview', { params });
export const getAnalyticsTrends = (params) => api.get('/analytics/trends', { params });
export const getMealTiming = (params) => api.get('/analytics/meal-timing', { params });
export const getFastingInsights = (params) => api.get('/analytics/fasting-insights', { params });
export const getHeartRateAnalytics = (params) => api.get('/analytics/heart-rate', { params });

// ─── Recipes ─────────────────────────────────────────────────────────────────
export const getRecipes = () => api.get('/recipes');
export const getRecipe = (id) => api.get(`/recipes/${id}`);
export const createRecipe = (data) => api.post('/recipes', data);
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`);

// ─── Water ───────────────────────────────────────────────────────────────────
export const getWaterLogs = (params) => api.get('/logs/water', { params });
export const createWaterLog = (data) => api.post('/logs/water', data);
export const deleteWaterLog = (id) => api.delete(`/logs/water/${id}`);

// ─── Sleep ───────────────────────────────────────────────────────────────────
export const getSleepLogs = (params) => api.get('/logs/sleep', { params });
export const createSleepLog = (data) => api.post('/logs/sleep', data);
export const deleteSleepLog = (id) => api.delete(`/logs/sleep/${id}`);

// ─── Reports ─────────────────────────────────────────────────────────────────
export const getWellnessReport = (params) => api.get('/reports/wellness', { params });

export default api;
