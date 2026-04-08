const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');

// POST /api/tools/portion-reduction
router.post('/portion-reduction', validate([
  body('caloriesToCut').isFloat({ min: 1 }).withMessage('Calories to cut is required'),
]), async (req, res) => {
  try {
    const { caloriesToCut } = req.body;

    // Get common foods sorted by calorie density (easiest to reduce)
    const foods = await prisma.foodItem.findMany({
      where: { isArchived: false, caloriesPer100g: { gt: 80 } },
      orderBy: { caloriesPer100g: 'desc' },
      take: 15,
      include: { category: true },
    });

    const suggestions = foods.map(food => {
      const gramsToRemove = Math.round((caloriesToCut / food.caloriesPer100g) * 100);
      return {
        food: { id: food.id, name: food.name, localName: food.localName, category: food.category.name },
        caloriesPer100g: food.caloriesPer100g,
        gramsToRemove,
        servingDescription: food.servingDescription,
        suggestion: `Remove ~${gramsToRemove}g of ${food.name} to cut ${caloriesToCut} kcal`,
      };
    });

    return successResponse(res, { caloriesToCut, suggestions });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// POST /api/tools/portion-addition
router.post('/portion-addition', validate([
  body('caloriesToAdd').isFloat({ min: 1 }).withMessage('Calories to add is required'),
]), async (req, res) => {
  try {
    const { caloriesToAdd } = req.body;

    const foods = await prisma.foodItem.findMany({
      where: { isArchived: false, caloriesPer100g: { gt: 50 } },
      orderBy: { caloriesPer100g: 'asc' },
      take: 15,
      include: { category: true },
    });

    const suggestions = foods.map(food => {
      const gramsToAdd = Math.round((caloriesToAdd / food.caloriesPer100g) * 100);
      return {
        food: { id: food.id, name: food.name, localName: food.localName, category: food.category.name },
        caloriesPer100g: food.caloriesPer100g,
        gramsToAdd,
        servingDescription: food.servingDescription,
        suggestion: `Add ~${gramsToAdd}g of ${food.name} to gain ${caloriesToAdd} kcal`,
      };
    });

    return successResponse(res, { caloriesToAdd, suggestions });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// POST /api/tools/substitutions
router.post('/substitutions', validate([
  body('foodId').isInt().withMessage('Food ID is required'),
]), async (req, res) => {
  try {
    const { foodId } = req.body;
    const food = await prisma.foodItem.findUnique({
      where: { id: foodId },
      include: { category: true },
    });
    if (!food) return errorResponse(res, 'Food not found', 404);

    // Find lower-calorie alternatives in the same or similar categories
    const alternatives = await prisma.foodItem.findMany({
      where: {
        isArchived: false,
        id: { not: foodId },
        caloriesPer100g: { lt: food.caloriesPer100g },
      },
      orderBy: { caloriesPer100g: 'asc' },
      take: 10,
      include: { category: true },
    });

    const suggestions = alternatives.map(alt => ({
      food: { id: alt.id, name: alt.name, localName: alt.localName, category: alt.category.name },
      caloriesPer100g: alt.caloriesPer100g,
      calorieSaved: food.caloriesPer100g - alt.caloriesPer100g,
      suggestion: `Replace ${food.name} (${food.caloriesPer100g} kcal/100g) with ${alt.name} (${alt.caloriesPer100g} kcal/100g) — save ${food.caloriesPer100g - alt.caloriesPer100g} kcal per 100g`,
    }));

    return successResponse(res, {
      original: { id: food.id, name: food.name, caloriesPer100g: food.caloriesPer100g },
      suggestions,
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// POST /api/tools/recipe-calculate
router.post('/recipe-calculate', validate([
  body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient required'),
]), async (req, res) => {
  try {
    const { ingredients, servings = 1 } = req.body;
    let totalCalories = 0;
    let totalGrams = 0;
    const breakdown = [];

    for (const ing of ingredients) {
      const food = await prisma.foodItem.findUnique({
        where: { id: ing.foodId },
        include: { servingOptions: true },
      });
      if (!food) continue;

      const grams = ing.grams || (ing.quantity * (food.standardServingG || 100));
      const cal = (grams / 100) * food.caloriesPer100g;
      totalCalories += cal;
      totalGrams += grams;

      breakdown.push({
        food: food.name,
        grams: Math.round(grams),
        calories: Math.round(cal),
      });
    }

    return successResponse(res, {
      totalCalories: Math.round(totalCalories),
      totalGrams: Math.round(totalGrams),
      perServing: Math.round(totalCalories / servings),
      servings,
      breakdown,
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
