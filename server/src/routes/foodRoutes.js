const router = require('express').Router();
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/foods
router.get('/', async (req, res) => {
  try {
    const { search, categoryId, page = 1, limit = 50 } = req.query;
    const where = { isArchived: false };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { localName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [foods, total] = await Promise.all([
      prisma.foodItem.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true } },
          servingOptions: true,
        },
        orderBy: { name: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.foodItem.count({ where }),
    ]);

    return successResponse(res, { foods, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// GET /api/foods/:id
router.get('/:id', async (req, res) => {
  try {
    const food = await prisma.foodItem.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true,
        servingOptions: true,
      },
    });
    if (!food) return errorResponse(res, 'Food not found', 404);
    return successResponse(res, food);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// POST /api/foods
router.post('/', validate([
  body('name').notEmpty().withMessage('Name is required'),
  body('categoryId').isInt().withMessage('Category is required'),
  body('caloriesPer100g').isFloat({ min: 0 }).withMessage('Calories per 100g must be a positive number'),
]), async (req, res) => {
  try {
    const food = await prisma.foodItem.create({
      data: {
        ...req.body,
        isUserAdded: true,
        confidenceLevel: 'USER_ADDED',
      },
      include: { category: true, servingOptions: true },
    });
    return successResponse(res, food, 'Food created successfully', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// PUT /api/foods/:id
router.put('/:id', async (req, res) => {
  try {
    const food = await prisma.foodItem.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: { category: true, servingOptions: true },
    });
    return successResponse(res, food, 'Food updated successfully');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// DELETE /api/foods/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.foodItem.update({
      where: { id: parseInt(req.params.id) },
      data: { isArchived: true },
    });
    return successResponse(res, null, 'Food deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
