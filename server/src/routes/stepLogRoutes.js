const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { getLocalDateKey } = require('../utils/dateHelpers');

// GET /api/logs/steps
router.get('/', async (req, res) => {
  try {
    const { date, startDate, endDate, page = 1, limit = 50 } = req.query;
    const where = {};
    if (date) where.localDateKey = date;
    else if (startDate && endDate) where.localDateKey = { gte: startDate, lte: endDate };

    const [logs, total] = await Promise.all([
      prisma.stepLog.findMany({
        where,
        orderBy: { loggedAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.stepLog.count({ where }),
    ]);

    // Compute daily totals
    const dailyTotals = {};
    logs.forEach(l => {
      dailyTotals[l.localDateKey] = (dailyTotals[l.localDateKey] || 0) + l.steps;
    });

    return successResponse(res, { logs, total, dailyTotals });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// POST /api/logs/steps
router.post('/', validate([
  body('steps').isInt({ min: 1 }).withMessage('Steps must be a positive integer'),
]), async (req, res) => {
  try {
    const { steps, note, loggedAt } = req.body;
    const log = await prisma.stepLog.create({
      data: {
        steps,
        note,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        localDateKey: getLocalDateKey(loggedAt || new Date()),
      },
    });
    return successResponse(res, log, 'Steps logged', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// PUT /api/logs/steps/:id
router.put('/:id', async (req, res) => {
  try {
    const log = await prisma.stepLog.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    return successResponse(res, log, 'Step log updated');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// DELETE /api/logs/steps/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.stepLog.delete({ where: { id: parseInt(req.params.id) } });
    return successResponse(res, null, 'Step log deleted');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
