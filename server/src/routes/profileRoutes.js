const router = require('express').Router();
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { calculateBMR, calculateTDEE, calculateDailyTarget, calculateBMI, getBMICategory } = require('../utils/calorieEngine');

// GET /api/profile
router.get('/', async (req, res) => {
  try {
    let profile = await prisma.userProfileLocal.findUnique({ where: { id: 1 } });
    if (!profile) {
      profile = await prisma.userProfileLocal.create({ data: { id: 1 } });
    }

    let computed = null;
    if (profile.sex && profile.age && profile.weightKg && profile.heightCm) {
      const bmr = calculateBMR(profile.sex, profile.weightKg, profile.heightCm, profile.age);
      const tdee = calculateTDEE(bmr, profile.activityLevel);
      const target = calculateDailyTarget(tdee, profile.goal, profile.targetWeeklyChangeKg);
      const bmi = calculateBMI(profile.weightKg, profile.heightCm);
      computed = {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        dailyTarget: Math.round(target),
        bmi,
        bmiCategory: getBMICategory(bmi),
      };
    }

    return successResponse(res, { profile, computed });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// PUT /api/profile
router.put('/', async (req, res) => {
  try {
    const profile = await prisma.userProfileLocal.upsert({
      where: { id: 1 },
      update: req.body,
      create: { id: 1, ...req.body },
    });

    // Recalculate target if enough data
    let computed = null;
    if (profile.sex && profile.age && profile.weightKg && profile.heightCm) {
      const bmr = calculateBMR(profile.sex, profile.weightKg, profile.heightCm, profile.age);
      const tdee = calculateTDEE(bmr, profile.activityLevel);
      const target = calculateDailyTarget(tdee, profile.goal, profile.targetWeeklyChangeKg);
      computed = { bmr: Math.round(bmr), tdee: Math.round(tdee), dailyTarget: Math.round(target) };

      // Auto-update daily calorie target
      await prisma.userProfileLocal.update({
        where: { id: 1 },
        data: { dailyCalorieTarget: Math.round(target) },
      });
    }

    return successResponse(res, { profile, computed }, 'Profile updated');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
