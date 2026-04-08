const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { getLocalDateKey } = require('../utils/dateHelpers');

// GET /api/logs/water
router.get('/', async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    const where = {};
    if (date) where.localDateKey = date;
    else if (startDate && endDate) where.localDateKey = { gte: startDate, lte: endDate };

    const logs = await prisma.waterLog.findMany({
      where,
      orderBy: { loggedAt: 'desc' },
      take: 200,
    });

    // Daily totals
    const dailyTotals = {};
    logs.forEach(l => {
      dailyTotals[l.localDateKey] = (dailyTotals[l.localDateKey] || 0) + l.amountMl;
    });

    const todayKey = getLocalDateKey();
    const todayTotal = dailyTotals[todayKey] || 0;

    return successResponse(res, { logs, dailyTotals, todayTotal });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// POST /api/logs/water
router.post('/', validate([
  body('amountMl').isInt({ min: 1 }).withMessage('Amount must be positive'),
]), async (req, res) => {
  try {
    const { amountMl, source, note } = req.body;
    const log = await prisma.waterLog.create({
      data: {
        amountMl,
        source: source || 'glass',
        note,
        localDateKey: getLocalDateKey(),
      },
    });
    return successResponse(res, log, 'Water logged', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// DELETE /api/logs/water/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.waterLog.delete({ where: { id: parseInt(req.params.id) } });
    return successResponse(res, null, 'Water log deleted');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
