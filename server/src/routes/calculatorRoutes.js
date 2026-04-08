const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { successResponse, errorResponse } = require('../utils/response');
const { calculateBMR, calculateTDEE, calculateDailyTarget, calculateBMI, getBMICategory } = require('../utils/calorieEngine');

// POST /api/calculator/tdee
router.post('/tdee', validate([
  body('sex').isIn(['male', 'female']).withMessage('Sex must be male or female'),
  body('age').isInt({ min: 10, max: 120 }).withMessage('Age must be between 10 and 120'),
  body('weightKg').isFloat({ min: 20 }).withMessage('Weight is required'),
  body('heightCm').isFloat({ min: 50 }).withMessage('Height is required'),
  body('activityLevel').notEmpty().withMessage('Activity level is required'),
  body('goal').isIn(['MAINTAIN', 'LOSE', 'GAIN']).withMessage('Goal must be MAINTAIN, LOSE, or GAIN'),
]), async (req, res) => {
  try {
    const { sex, age, weightKg, heightCm, activityLevel, goal, targetWeeklyChangeKg = 0.5 } = req.body;

    const bmr = calculateBMR(sex, weightKg, heightCm, age);
    const tdee = calculateTDEE(bmr, activityLevel);
    const dailyTarget = calculateDailyTarget(tdee, goal, targetWeeklyChangeKg);
    const bmi = calculateBMI(weightKg, heightCm);

    const deficit = goal === 'LOSE' ? Math.round(tdee - dailyTarget) : 0;
    const surplus = goal === 'GAIN' ? Math.round(dailyTarget - tdee) : 0;

    return successResponse(res, {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      dailyTarget: Math.round(dailyTarget),
      deficit,
      surplus,
      bmi,
      bmiCategory: getBMICategory(bmi),
      weeklyChangeKg: targetWeeklyChangeKg,
      explanation: goal === 'LOSE'
        ? `To lose ${targetWeeklyChangeKg}kg/week, eat ${Math.round(dailyTarget)} kcal/day (${deficit} kcal deficit).`
        : goal === 'GAIN'
        ? `To gain ${targetWeeklyChangeKg}kg/week, eat ${Math.round(dailyTarget)} kcal/day (${surplus} kcal surplus).`
        : `To maintain weight, eat about ${Math.round(tdee)} kcal/day.`,
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
