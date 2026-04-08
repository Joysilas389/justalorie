const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { getLocalDateKey } = require('../utils/dateHelpers');

// GET /api/logs/weight
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 100 } = req.query;
    const where = {};
    if (startDate && endDate) where.localDateKey = { gte: startDate, lte: endDate };

    const [logs, total] = await Promise.all([
      prisma.weightLog.findMany({
        where,
        orderBy: { loggedAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.weightLog.count({ where }),
    ]);

    const latest = logs.length > 0 ? logs[0] : null;
    let trend = null;
    if (logs.length >= 2) {
      const diff = logs[0].weightKg - logs[logs.length - 1].weightKg;
      trend = { changeKg: Math.round(diff * 100) / 100, direction: diff > 0 ? 'gaining' : diff < 0 ? 'losing' : 'stable' };
    }

    return successResponse(res, { logs, total, latest, trend });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// POST /api/logs/weight
router.post('/', validate([
  body('weightKg').isFloat({ min: 20, max: 500 }).withMessage('Weight must be between 20 and 500 kg'),
]), async (req, res) => {
  try {
    const { weightKg, note, loggedAt } = req.body;
    const log = await prisma.weightLog.create({
      data: {
        weightKg,
        note,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
        localDateKey: getLocalDateKey(loggedAt || new Date()),
      },
    });
    // Also update profile with latest weight
    await prisma.userProfileLocal.update({ where: { id: 1 }, data: { weightKg } }).catch(() => {});
    return successResponse(res, log, 'Weight logged', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// PUT /api/logs/weight/:id
router.put('/:id', async (req, res) => {
  try {
    const log = await prisma.weightLog.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    return successResponse(res, log, 'Weight log updated');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// DELETE /api/logs/weight/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.weightLog.delete({ where: { id: parseInt(req.params.id) } });
    return successResponse(res, null, 'Weight log deleted');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
