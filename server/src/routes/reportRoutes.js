const router = require('express').Router();
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { getDateRange } = require('../utils/dateHelpers');
const { calculateBMI, getBMICategory } = require('../utils/calorieEngine');

// GET /api/reports/wellness?days=30
router.get('/wellness', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const { start, end } = getDateRange(days);
    const startKey = start.toISOString().split('T')[0];
    const endKey = end.toISOString().split('T')[0];

    const profile = await prisma.userProfileLocal.findUnique({ where: { id: 1 } });

    // Food data
    const foodLogs = await prisma.foodLog.findMany({
      where: { localDateKey: { gte: startKey, lte: endKey } },
    });
    const dailyCals = {};
    foodLogs.forEach(l => {
      dailyCals[l.localDateKey] = (dailyCals[l.localDateKey] || 0) + l.caloriesTotal;
    });
    const calDays = Object.values(dailyCals);
    const avgCalories = calDays.length > 0 ? Math.round(calDays.reduce((a, b) => a + b, 0) / calDays.length) : 0;
    const totalMeals = foodLogs.length;

    // Weight
    const weights = await prisma.weightLog.findMany({
      where: { localDateKey: { gte: startKey, lte: endKey } },
      orderBy: { loggedAt: 'asc' },
    });
    const startWeight = weights.length > 0 ? weights[0].weightKg : null;
    const endWeight = weights.length > 0 ? weights[weights.length - 1].weightKg : null;
    const weightChange = startWeight && endWeight ? Math.round((endWeight - startWeight) * 100) / 100 : null;

    // Steps
    const steps = await prisma.stepLog.findMany({
      where: { localDateKey: { gte: startKey, lte: endKey } },
    });
    const dailySteps = {};
    steps.forEach(s => { dailySteps[s.localDateKey] = (dailySteps[s.localDateKey] || 0) + s.steps; });
    const stepDays = Object.values(dailySteps);
    const avgSteps = stepDays.length > 0 ? Math.round(stepDays.reduce((a, b) => a + b, 0) / stepDays.length) : 0;

    // Fasting
    const fasts = await prisma.fastingLog.findMany({
      where: { localDateKey: { gte: startKey, lte: endKey } },
    });
    const completedFasts = fasts.filter(f => f.status === 'COMPLETED').length;
    const fastingRate = fasts.length > 0 ? Math.round((completedFasts / fasts.length) * 100) : 0;

    // Water
    const waterLogs = await prisma.waterLog.findMany({
      where: { localDateKey: { gte: startKey, lte: endKey } },
    }).catch(() => []);
    const dailyWater = {};
    waterLogs.forEach(w => { dailyWater[w.localDateKey] = (dailyWater[w.localDateKey] || 0) + w.amountMl; });
    const waterDays = Object.values(dailyWater);
    const avgWater = waterDays.length > 0 ? Math.round(waterDays.reduce((a, b) => a + b, 0) / waterDays.length) : 0;

    // Sleep
    const sleepLogs = await prisma.sleepLog.findMany({
      where: { localDateKey: { gte: startKey, lte: endKey } },
    }).catch(() => []);
    const avgSleepMin = sleepLogs.length > 0
      ? Math.round(sleepLogs.reduce((s, l) => s + l.durationMin, 0) / sleepLogs.length)
      : 0;
    const avgSleepQuality = sleepLogs.length > 0
      ? Math.round(sleepLogs.reduce((s, l) => s + l.quality, 0) / sleepLogs.length * 10) / 10
      : 0;

    // Heart rate
    const hrLogs = await prisma.heartRateLog.findMany({
      where: { localDateKey: { gte: startKey, lte: endKey } },
    });
    const avgHR = hrLogs.length > 0
      ? Math.round(hrLogs.reduce((s, l) => s + l.bpm, 0) / hrLogs.length)
      : null;

    // BMI
    const bmi = profile?.weightKg && profile?.heightCm
      ? calculateBMI(profile.weightKg, profile.heightCm) : null;

    return successResponse(res, {
      period: { days, startDate: startKey, endDate: endKey },
      profile: {
        name: profile?.name || 'User',
        age: profile?.age,
        sex: profile?.sex,
        goal: profile?.goal,
        dailyTarget: profile?.dailyCalorieTarget || 2400,
      },
      nutrition: {
        avgDailyCalories: avgCalories,
        dailyTarget: profile?.dailyCalorieTarget || 2400,
        totalMealsLogged: totalMeals,
        daysTracked: calDays.length,
        adherence: calDays.length > 0 ? Math.round((calDays.length / days) * 100) : 0,
      },
      weight: {
        startWeight,
        endWeight,
        change: weightChange,
        direction: weightChange > 0 ? 'gained' : weightChange < 0 ? 'lost' : 'maintained',
        entries: weights.length,
      },
      bmi: bmi ? { value: bmi, category: getBMICategory(bmi) } : null,
      steps: {
        avgDaily: avgSteps,
        target: profile?.dailyStepTarget || 10000,
        daysTracked: stepDays.length,
      },
      fasting: {
        totalSessions: fasts.length,
        completed: completedFasts,
        completionRate: fastingRate,
      },
      water: {
        avgDailyMl: avgWater,
        avgDailyGlasses: Math.round(avgWater / 250 * 10) / 10,
        daysTracked: waterDays.length,
      },
      sleep: {
        avgDurationMin: avgSleepMin,
        avgDurationHours: Math.round(avgSleepMin / 60 * 10) / 10,
        avgQuality: avgSleepQuality,
        entries: sleepLogs.length,
      },
      heartRate: {
        avgBpm: avgHR,
        readings: hrLogs.length,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
