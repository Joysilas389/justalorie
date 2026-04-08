const router = require('express').Router();
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    let settings = await prisma.appSetting.findUnique({ where: { id: 1 } });
    if (!settings) {
      settings = await prisma.appSetting.create({ data: { id: 1 } });
    }
    return successResponse(res, settings);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  try {
    const settings = await prisma.appSetting.upsert({
      where: { id: 1 },
      update: req.body,
      create: { id: 1, ...req.body },
    });
    return successResponse(res, settings, 'Settings updated');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// POST /api/settings/cleanup-duplicates - Remove duplicate food entries
router.post('/cleanup-duplicates', async (req, res) => {
  try {
    // Find all food items grouped by name
    const allFoods = await prisma.foodItem.findMany({
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });

    const seen = {};
    const toDelete = [];

    for (const food of allFoods) {
      if (seen[food.name]) {
        toDelete.push(food.id);
      } else {
        seen[food.name] = food.id;
      }
    }

    if (toDelete.length > 0) {
      // Delete serving options for duplicates first
      await prisma.foodServingOption.deleteMany({
        where: { foodId: { in: toDelete } },
      });
      // Delete the duplicate foods
      await prisma.foodItem.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    return successResponse(res, {
      duplicatesRemoved: toDelete.length,
      remainingFoods: Object.keys(seen).length,
    }, `Removed ${toDelete.length} duplicate food entries`);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
