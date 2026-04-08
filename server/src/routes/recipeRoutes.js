const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      where: { isArchived: false },
      include: {
        ingredients: { include: { food: { select: { id: true, name: true, caloriesPer100g: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, recipes);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// GET /api/recipes/:id
router.get('/:id', async (req, res) => {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        ingredients: { include: { food: true } },
      },
    });
    if (!recipe) return errorResponse(res, 'Recipe not found', 404);
    return successResponse(res, recipe);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// POST /api/recipes
router.post('/', validate([
  body('name').notEmpty().withMessage('Recipe name is required'),
  body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient required'),
]), async (req, res) => {
  try {
    const { name, description, servings = 1, ingredients } = req.body;

    // Calculate totals
    let totalCalories = 0;
    let totalGrams = 0;
    const ingredientData = [];

    for (const ing of ingredients) {
      const food = await prisma.foodItem.findUnique({ where: { id: ing.foodId } });
      if (!food) continue;
      const grams = ing.grams || ing.quantity * (food.standardServingG || 100);
      const cal = (grams / 100) * food.caloriesPer100g;
      totalCalories += cal;
      totalGrams += grams;
      ingredientData.push({
        foodId: ing.foodId,
        quantity: ing.quantity || 1,
        unit: ing.unit || 'g',
        gramsUsed: Math.round(grams),
        calories: Math.round(cal),
      });
    }

    const recipe = await prisma.recipe.create({
      data: {
        name,
        description,
        servings,
        totalCalories: Math.round(totalCalories),
        totalGrams: Math.round(totalGrams),
        ingredients: { create: ingredientData },
      },
      include: { ingredients: { include: { food: true } } },
    });

    return successResponse(res, recipe, 'Recipe created', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// DELETE /api/recipes/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.recipe.update({
      where: { id: parseInt(req.params.id) },
      data: { isArchived: true },
    });
    return successResponse(res, null, 'Recipe deleted');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
