const router = require('express').Router();
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { getDateRange, parseCustomDateRange } = require('../utils/dateHelpers');

function getRange(req) {
  const { days, startDate, endDate } = req.query;
  if (startDate && endDate) return parseCustomDateRange(startDate, endDate);
  return getDateRange(parseInt(days) || 7);
}

// GET /api/analytics/overview
router.get('/overview', async (req, res) => {
  try {
    const { start, end } = getRange(req);
    const startKey = start.toISOString().split('T')[0];
    const endKey = end.toISOString().split('T')[0];

    const foodLogs = await prisma.foodLog.findMany({
      where: { localDateKey: { gte: startKey, lte: endKey } },
      orderBy: { loggedAt: 'asc' },
    });

    // Group by day
    const dailyCalories = {};
    foodLogs.forEach(l => {
      if (!dailyCalories[l.localDateKey]) dailyCalories[l.localDateKey] = 0;
      dailyCalories[l.localDateKey] += l.caloriesTotal;
    });

    const profile = await prisma.userProfileLocal.findUnique({ where: { id: 1 } });
    const target = profile?.dailyCalorieTarget || 2400;

    const chartData = Object.entries(dailyCalories).map(([date, cal]) => ({
      date,
      calories: Math.round(cal),
      target,
      difference: Math.round(cal - target),
    }));

    const avgCalories = chartData.length > 0
      ? Math.round(chartData.reduce((s, d) => s + d.calories, 0) / chartData.length)
      : 0;

    return successResponse(res, { chartData, avgCalories, target, totalDays: chartData.length });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// GET /api/analytics/trends
router.get('/trends', async (req, res) => {
  try {
    const { start, end } = getRange(req);
    const startKey = start.toISOString().split('T')[0];
    const endKey = end.toISOString().split('T')[0];

    const [weights, steps, foodLogs] = await Promise.all([
      prisma.weightLog.findMany({
        where: { localDateKey: { gte: startKey, lte: endKey } },
        orderBy: { loggedAt: 'asc' },
      }),
      prisma.stepLog.findMany({
        where: { localDateKey: { gte: startKey, lte: endKey } },
        orderBy: { loggedAt: 'asc' },
      }),
      prisma.foodLog.findMany({
        where: { localDateKey: { gte: startKey, lte: endKey } },
        orderBy: { loggedAt: 'asc' },
      }),
    ]);

    // Weight trend
    const weightData = weights.map(w => ({ date: w.localDateKey, weight: w.weightKg }));

    // Steps by day
    const dailySteps = {};
    steps.forEach(s => {
      dailySteps[s.localDateKey] = (dailySteps[s.localDateKey] || 0) + s.steps;
    });
    const stepsData = Object.entries(dailySteps).map(([date, steps]) => ({ date, steps }));

    // Surplus/deficit by day
    const profile = await prisma.userProfileLocal.findUnique({ where: { id: 1 } });
    const target = profile?.dailyCalorieTarget || 2400;
    const dailyCals = {};
    foodLogs.forEach(l => {
      dailyCals[l.localDateKey] = (dailyCals[l.localDateKey] || 0) + l.caloriesTotal;
    });
    const surplusDeficitData = Object.entries(dailyCals).map(([date, cal]) => ({
      date,
      calories: Math.round(cal),
      target,
      difference: Math.round(cal - target),
    }));

    return successResponse(res, { weightData, stepsData, surplusDeficitData });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// GET /api/analytics/meal-timing
router.get('/meal-timing', async (req, res) => {
  try {
    const { start, end } = getRange(req);
    const startKey = start.toISOString().split('T')[0];
    const endKey = end.toISOString().split('T')[0];

    const logs = await prisma.foodLog.findMany({
      where: { localDateKey: { gte: startKey, lte: endKey } },
      orderBy: { loggedAt: 'asc' },
    });

    // Group by day to find first/last meal
    const days = {};
    logs.forEach(l => {
      if (!days[l.localDateKey]) days[l.localDateKey] = { first: l.loggedAt, last: l.loggedAt, count: 0 };
      const d = days[l.localDateKey];
      if (new Date(l.loggedAt) < new Date(d.first)) d.first = l.loggedAt;
      if (new Date(l.loggedAt) > new Date(d.last)) d.last = l.loggedAt;
      d.count++;
    });

    const mealTimingData = Object.entries(days).map(([date, d]) => {
      const firstH = new Date(d.first).getHours() + new Date(d.first).getMinutes() / 60;
      const lastH = new Date(d.last).getHours() + new Date(d.last).getMinutes() / 60;
      return {
        date,
        firstMealHour: Math.round(firstH * 10) / 10,
        lastMealHour: Math.round(lastH * 10) / 10,
        eatingWindowHours: Math.round((lastH - firstH) * 10) / 10,
        mealCount: d.count,
        lateNight: lastH >= 21,
      };
    });

    const avgFirstMeal = mealTimingData.length > 0
      ? Math.round(mealTimingData.reduce((s, d) => s + d.firstMealHour, 0) / mealTimingData.length * 10) / 10
      : null;
    const avgLastMeal = mealTimingData.length > 0
      ? Math.round(mealTimingData.reduce((s, d) => s + d.lastMealHour, 0) / mealTimingData.length * 10) / 10
      : null;
    const lateNightCount = mealTimingData.filter(d => d.lateNight).length;

    return successResponse(res, {
      mealTimingData,
      avgFirstMealHour: avgFirstMeal,
      avgLastMealHour: avgLastMeal,
      lateNightDays: lateNightCount,
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// GET /api/analytics/fasting-insights
router.get('/fasting-insights', async (req, res) => {
  try {
    const { start, end } = getRange(req);
    const startKey = start.toISOString().split('T')[0];
    const endKey = end.toISOString().split('T')[0];

    const logs = await prisma.fastingLog.findMany({
      where: { localDateKey: { gte: startKey, lte: endKey } },
      orderBy: { startedAt: 'asc' },
    });

    const completed = logs.filter(l => l.status === 'COMPLETED');
    const missed = logs.filter(l => l.status === 'MISSED');
    const partial = logs.filter(l => l.status === 'PARTIAL');

    const durations = completed
      .filter(l => l.endedAt)
      .map(l => (new Date(l.endedAt) - new Date(l.startedAt)) / (1000 * 60 * 60));
    const avgDuration = durations.length > 0
      ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length * 10) / 10
      : 0;

    // Best day of week
    const dayCount = {};
    completed.forEach(l => {
      const day = new Date(l.startedAt).toLocaleDateString('en', { weekday: 'long' });
      dayCount[day] = (dayCount[day] || 0) + 1;
    });
    const bestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return successResponse(res, {
      total: logs.length,
      completed: completed.length,
      missed: missed.length,
      partial: partial.length,
      completionRate: logs.length > 0 ? Math.round((completed.length / logs.length) * 100) : 0,
      avgDurationHours: avgDuration,
      bestDay,
      chartData: logs.map(l => ({
        date: l.localDateKey,
        status: l.status,
        schedule: l.schedule,
        durationHours: l.endedAt
          ? Math.round((new Date(l.endedAt) - new Date(l.startedAt)) / (1000 * 60 * 60) * 10) / 10
          : null,
      })),
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// GET /api/analytics/heart-rate
router.get('/heart-rate', async (req, res) => {
  try {
    const { start, end } = getRange(req);
    const startKey = start.toISOString().split('T')[0];
    const endKey = end.toISOString().split('T')[0];

    const logs = await prisma.heartRateLog.findMany({
      where: { localDateKey: { gte: startKey, lte: endKey } },
      orderBy: { capturedAt: 'asc' },
    });

    // Daily aggregation
    const dailyData = {};
    logs.forEach(l => {
      if (!dailyData[l.localDateKey]) {
        dailyData[l.localDateKey] = { min: l.bpm, max: l.bpm, total: 0, count: 0 };
      }
      const d = dailyData[l.localDateKey];
      d.min = Math.min(d.min, l.bpm);
      d.max = Math.max(d.max, l.bpm);
      d.total += l.bpm;
      d.count++;
    });

    const chartData = Object.entries(dailyData).map(([date, d]) => ({
      date,
      avgBpm: Math.round(d.total / d.count),
      minBpm: d.min,
      maxBpm: d.max,
      readings: d.count,
    }));

    return successResponse(res, { chartData, totalReadings: logs.length });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
