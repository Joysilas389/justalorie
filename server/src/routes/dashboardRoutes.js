const router = require('express').Router();
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { getLocalDateKey } = require('../utils/dateHelpers');

// GET /api/dashboard/summary
router.get('/summary', async (req, res) => {
  try {
    const today = getLocalDateKey();
    const profile = await prisma.userProfileLocal.findUnique({ where: { id: 1 } });

    // Today's food logs
    const todayFoodLogs = await prisma.foodLog.findMany({
      where: { localDateKey: today },
      include: { food: { include: { category: true } } },
      orderBy: { loggedAt: 'desc' },
    });

    const caloriesConsumed = todayFoodLogs.reduce((sum, l) => sum + l.caloriesTotal, 0);
    const drinkCalories = todayFoodLogs
      .filter(l => l.mealType === 'DRINK' || l.food?.category?.slug === 'local-drinks' || l.food?.category?.slug === 'bottled-canned-drinks' || l.food?.category?.slug === 'malt-drinks')
      .reduce((sum, l) => sum + l.caloriesTotal, 0);
    const dailyTarget = profile?.dailyCalorieTarget || 2400;
    const remaining = dailyTarget - caloriesConsumed;

    // Today's steps
    const todaySteps = await prisma.stepLog.findMany({ where: { localDateKey: today } });
    const totalSteps = todaySteps.reduce((sum, l) => sum + l.steps, 0);

    // Latest weight
    const latestWeight = await prisma.weightLog.findFirst({ orderBy: { loggedAt: 'desc' } });

    // Active fasting
    const activeFast = await prisma.fastingLog.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { startedAt: 'desc' },
    });

    let fastingInfo = null;
    if (activeFast) {
      const elapsed = (new Date() - new Date(activeFast.startedAt)) / (1000 * 60 * 60);
      const targetH = activeFast.customFastHours || 16;
      fastingInfo = {
        status: 'ACTIVE',
        schedule: activeFast.schedule,
        elapsedHours: Math.round(elapsed * 10) / 10,
        targetHours: targetH,
        progressPercent: Math.min(100, Math.round((elapsed / targetH) * 100)),
      };
    }

    // Latest heart rate
    const latestHR = await prisma.heartRateLog.findFirst({ orderBy: { capturedAt: 'desc' } });
    const liveSession = await prisma.heartRateSession.findFirst({ where: { isLive: true } });

    // Today's water
    const todayWater = await prisma.waterLog.findMany({ where: { localDateKey: today } }).catch(() => []);
    const waterTotalMl = todayWater.reduce((sum, l) => sum + l.amountMl, 0);

    // Latest sleep
    const latestSleep = await prisma.sleepLog.findFirst({ orderBy: { bedtime: 'desc' } }).catch(() => null);

    // Recent foods (last 5)
    const recentFoods = todayFoodLogs.slice(0, 5);

    // Meal breakdown
    const mealBreakdown = {};
    todayFoodLogs.forEach(l => {
      if (!mealBreakdown[l.mealType]) mealBreakdown[l.mealType] = 0;
      mealBreakdown[l.mealType] += l.caloriesTotal;
    });

    return successResponse(res, {
      date: today,
      dailyTarget: Math.round(dailyTarget),
      caloriesConsumed: Math.round(caloriesConsumed),
      remaining: Math.round(remaining),
      surplus: remaining < 0 ? Math.abs(Math.round(remaining)) : 0,
      deficit: remaining > 0 ? Math.round(remaining) : 0,
      drinkCalories: Math.round(drinkCalories),
      stepsToday: totalSteps,
      stepTarget: profile?.dailyStepTarget || 10000,
      latestWeight: latestWeight?.weightKg || null,
      fasting: fastingInfo,
      heartRate: {
        latestBpm: latestHR?.bpm || null,
        isLive: !!liveSession,
      },
      waterTodayMl: waterTotalMl,
      waterGlasses: Math.round(waterTotalMl / 250 * 10) / 10,
      sleep: latestSleep ? {
        durationMin: latestSleep.durationMin,
        quality: latestSleep.quality,
        durationHours: Math.round(latestSleep.durationMin / 60 * 10) / 10,
      } : null,
      recentFoods: recentFoods.map(l => ({
        id: l.id,
        name: l.food.name,
        calories: Math.round(l.caloriesTotal),
        quantity: l.quantity,
        unit: l.unit,
        mealType: l.mealType,
        time: l.loggedAt,
      })),
      mealBreakdown,
      profile: {
        name: profile?.name,
        goal: profile?.goal,
      },
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
