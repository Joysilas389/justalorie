const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { calculateFoodCalories } = require('../utils/calorieEngine');
const { getLocalDateKey } = require('../utils/dateHelpers');

// GET /api/logs/food
router.get('/', async (req, res) => {
  try {
    const { date, startDate, endDate, mealType, page = 1, limit = 50 } = req.query;
    const where = {};

    if (date) {
      where.localDateKey = date;
    } else if (startDate && endDate) {
      where.localDateKey = { gte: startDate, lte: endDate };
    }
    if (mealType) where.mealType = mealType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      prisma.foodLog.findMany({
        where,
        include: {
          food: {
            include: {
              category: { select: { name: true, icon: true } },
              servingOptions: true,
            },
          },
        },
        orderBy: { loggedAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.foodLog.count({ where }),
    ]);

    return successResponse(res, { logs, total });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// POST /api/logs/food
router.post('/', validate([
  body('foodId').isInt().withMessage('Food ID is required'),
  body('quantity').isFloat({ min: 0.01 }).withMessage('Quantity must be positive'),
  body('unit').notEmpty().withMessage('Unit is required'),
]), async (req, res) => {
  try {
    const { foodId, quantity, unit, mealType, preparationType, note, mood, hunger, energy } = req.body;

    const food = await prisma.foodItem.findUnique({
      where: { id: foodId },
      include: { servingOptions: true },
    });
    if (!food) return errorResponse(res, 'Food not found', 404);

    const calc = calculateFoodCalories(food, quantity, unit, food.servingOptions);

    const log = await prisma.foodLog.create({
      data: {
        foodId,
        quantity,
        unit,
        gramsConsumed: calc.gramsConsumed,
        caloriesTotal: calc.caloriesTotal,
        mealType: mealType || 'OTHER',
        preparationType: preparationType || food.preparationType || 'OTHER',
        note,
        mood,
        hunger,
        energy,
        localDateKey: getLocalDateKey(),
      },
      include: { food: { include: { category: true } } },
    });

    return successResponse(res, { log, calculation: calc }, 'Food logged successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// PUT /api/logs/food/:id
router.put('/:id', async (req, res) => {
  try {
    const { quantity, unit, mealType, note, mood, hunger, energy } = req.body;
    const existing = await prisma.foodLog.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { food: { include: { servingOptions: true } } },
    });
    if (!existing) return errorResponse(res, 'Log not found', 404);

    let updateData = { mealType, note, mood, hunger, energy };

    if (quantity && unit) {
      const calc = calculateFoodCalories(existing.food, quantity, unit, existing.food.servingOptions);
      updateData = { ...updateData, quantity, unit, gramsConsumed: calc.gramsConsumed, caloriesTotal: calc.caloriesTotal };
    }

    const log = await prisma.foodLog.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
      include: { food: { include: { category: true } } },
    });

    return successResponse(res, log, 'Log updated');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// DELETE /api/logs/food/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.foodLog.delete({ where: { id: parseInt(req.params.id) } });
    return successResponse(res, null, 'Log deleted');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
