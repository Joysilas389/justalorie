const router = require('express').Router();
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');

router.get('/', async (req, res) => {
  try {
    const categories = await prisma.foodCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { foods: true } } },
    });
    return successResponse(res, categories);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
