const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { getLocalDateKey } = require('../utils/dateHelpers');

const SCHEDULE_HOURS = {
  TWELVE_TWELVE: { fast: 12, eat: 12 },
  FOURTEEN_TEN: { fast: 14, eat: 10 },
  SIXTEEN_EIGHT: { fast: 16, eat: 8 },
  EIGHTEEN_SIX: { fast: 18, eat: 6 },
  TWENTY_FOUR: { fast: 20, eat: 4 },
};

// GET /api/logs/fasting
router.get('/', async (req, res) => {
  try {
    const { date, startDate, endDate, status, page = 1, limit = 50 } = req.query;
    const where = {};
    if (date) where.localDateKey = date;
    else if (startDate && endDate) where.localDateKey = { gte: startDate, lte: endDate };
    if (status) where.status = status;

    const [logs, total] = await Promise.all([
      prisma.fastingLog.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.fastingLog.count({ where }),
    ]);

    // Calculate active fast info
    const activeFast = await prisma.fastingLog.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { startedAt: 'desc' },
    });

    let activeInfo = null;
    if (activeFast) {
      const now = new Date();
      const elapsed = (now - new Date(activeFast.startedAt)) / (1000 * 60 * 60);
      const targetHours = activeFast.customFastHours || SCHEDULE_HOURS[activeFast.schedule]?.fast || 16;
      activeInfo = {
        ...activeFast,
        elapsedHours: Math.round(elapsed * 100) / 100,
        targetHours,
        progressPercent: Math.min(100, Math.round((elapsed / targetHours) * 100)),
        remainingHours: Math.max(0, Math.round((targetHours - elapsed) * 100) / 100),
      };
    }

    // Streak calculation
    const completedLogs = await prisma.fastingLog.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { localDateKey: 'desc' },
      take: 90,
    });
    let streak = 0;
    const today = getLocalDateKey();
    const dates = [...new Set(completedLogs.map(l => l.localDateKey))].sort().reverse();
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date();
      expected.setDate(expected.getDate() - i);
      const expectedKey = getLocalDateKey(expected);
      if (dates.includes(expectedKey)) streak++;
      else break;
    }

    return successResponse(res, { logs, total, activeFast: activeInfo, streak });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// POST /api/logs/fasting - Start a fast
router.post('/', validate([
  body('schedule').notEmpty().withMessage('Fasting schedule is required'),
]), async (req, res) => {
  try {
    const { schedule, customFastHours, customEatHours, note } = req.body;

    // End any active fasts
    await prisma.fastingLog.updateMany({
      where: { status: 'ACTIVE' },
      data: { status: 'PARTIAL', endedAt: new Date() },
    });

    const fastHours = customFastHours || SCHEDULE_HOURS[schedule]?.fast || 16;
    const startedAt = new Date();
    const targetEndAt = new Date(startedAt.getTime() + fastHours * 60 * 60 * 1000);

    const log = await prisma.fastingLog.create({
      data: {
        schedule,
        customFastHours,
        customEatHours,
        startedAt,
        targetEndAt,
        status: 'ACTIVE',
        note,
        localDateKey: getLocalDateKey(),
      },
    });

    return successResponse(res, log, 'Fast started', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// PUT /api/logs/fasting/:id - Update/complete a fast
router.put('/:id', async (req, res) => {
  try {
    const { status, note, endedAt } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (note !== undefined) updateData.note = note;
    if (status === 'COMPLETED' || endedAt) {
      updateData.endedAt = endedAt ? new Date(endedAt) : new Date();
    }

    const log = await prisma.fastingLog.update({
      where: { id: parseInt(req.params.id) },
      data: updateData,
    });
    return successResponse(res, log, 'Fast updated');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// DELETE /api/logs/fasting/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.fastingLog.delete({ where: { id: parseInt(req.params.id) } });
    return successResponse(res, null, 'Fasting log deleted');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
