const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { getLocalDateKey } = require('../utils/dateHelpers');

// GET /api/logs/sleep
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) where.localDateKey = { gte: startDate, lte: endDate };

    const logs = await prisma.sleepLog.findMany({
      where,
      orderBy: { bedtime: 'desc' },
      take: 100,
    });

    // Compute averages
    let avgDuration = 0;
    let avgQuality = 0;
    if (logs.length > 0) {
      avgDuration = Math.round(logs.reduce((s, l) => s + l.durationMin, 0) / logs.length);
      avgQuality = Math.round(logs.reduce((s, l) => s + l.quality, 0) / logs.length * 10) / 10;
    }

    const latest = logs.length > 0 ? logs[0] : null;

    return successResponse(res, { logs, latest, avgDurationMin: avgDuration, avgQuality });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// POST /api/logs/sleep
router.post('/', validate([
  body('bedtime').notEmpty().withMessage('Bedtime is required'),
  body('wakeTime').notEmpty().withMessage('Wake time is required'),
]), async (req, res) => {
  try {
    const { bedtime, wakeTime, quality, note } = req.body;
    const bed = new Date(bedtime);
    const wake = new Date(wakeTime);
    const durationMin = Math.round((wake - bed) / (1000 * 60));

    if (durationMin <= 0 || durationMin > 1440) {
      return errorResponse(res, 'Invalid sleep duration', 400);
    }

    const log = await prisma.sleepLog.create({
      data: {
        bedtime: bed,
        wakeTime: wake,
        durationMin,
        quality: quality || 3,
        note,
        localDateKey: getLocalDateKey(wake),
      },
    });
    return successResponse(res, log, 'Sleep logged', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// DELETE /api/logs/sleep/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.sleepLog.delete({ where: { id: parseInt(req.params.id) } });
    return successResponse(res, null, 'Sleep log deleted');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
