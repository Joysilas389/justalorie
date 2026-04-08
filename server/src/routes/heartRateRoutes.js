const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const prisma = require('../utils/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { getLocalDateKey } = require('../utils/dateHelpers');
const { broadcastHeartRate } = require('../realtime/heartRateWs');

// GET /api/logs/heart-rate
router.get('/', async (req, res) => {
  try {
    const { date, startDate, endDate, sessionId, page = 1, limit = 200 } = req.query;
    const where = {};
    if (date) where.localDateKey = date;
    else if (startDate && endDate) where.localDateKey = { gte: startDate, lte: endDate };
    if (sessionId) where.sessionId = parseInt(sessionId);

    const [logs, total] = await Promise.all([
      prisma.heartRateLog.findMany({
        where,
        orderBy: { capturedAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.heartRateLog.count({ where }),
    ]);

    // Daily summaries
    const summaries = {};
    logs.forEach(l => {
      if (!summaries[l.localDateKey]) {
        summaries[l.localDateKey] = { min: l.bpm, max: l.bpm, total: 0, count: 0 };
      }
      const s = summaries[l.localDateKey];
      s.min = Math.min(s.min, l.bpm);
      s.max = Math.max(s.max, l.bpm);
      s.total += l.bpm;
      s.count++;
    });
    Object.keys(summaries).forEach(k => {
      summaries[k].avg = Math.round(summaries[k].total / summaries[k].count);
    });

    return successResponse(res, { logs, total, summaries });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// POST /api/logs/heart-rate - Log a heart rate reading
router.post('/', validate([
  body('bpm').isInt({ min: 30, max: 250 }).withMessage('BPM must be between 30 and 250'),
]), async (req, res) => {
  try {
    const { bpm, sessionId, sourceType } = req.body;
    const now = new Date();

    const log = await prisma.heartRateLog.create({
      data: {
        bpm,
        sessionId: sessionId || null,
        sourceType: sourceType || 'MANUAL',
        capturedAt: now,
        localDateKey: getLocalDateKey(now),
      },
    });

    // Broadcast to WebSocket clients
    broadcastHeartRate({ bpm, capturedAt: now.toISOString(), sessionId });

    return successResponse(res, log, 'Heart rate logged', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// GET /api/heart-rate/sessions
router.get('/sessions', async (req, res) => {
  try {
    const { date, isLive } = req.query;
    const where = {};
    if (date) where.localDateKey = date;
    if (isLive !== undefined) where.isLive = isLive === 'true';

    const sessions = await prisma.heartRateSession.findMany({
      where,
      include: {
        logs: { orderBy: { capturedAt: 'asc' }, take: 500 },
        _count: { select: { logs: true } },
      },
      orderBy: { startedAt: 'desc' },
    });

    return successResponse(res, sessions);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// POST /api/heart-rate/sessions - Start a session
router.post('/sessions', async (req, res) => {
  try {
    const { sourceType, sessionLabel, note } = req.body;

    // End any currently live session
    await prisma.heartRateSession.updateMany({
      where: { isLive: true },
      data: { isLive: false, endedAt: new Date() },
    });

    const session = await prisma.heartRateSession.create({
      data: {
        sourceType: sourceType || 'MANUAL',
        sessionLabel,
        isLive: true,
        note,
        localDateKey: getLocalDateKey(),
      },
    });

    return successResponse(res, session, 'Heart rate session started', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// PUT /api/heart-rate/sessions/:id/stop
router.put('/sessions/:id/stop', async (req, res) => {
  try {
    const session = await prisma.heartRateSession.update({
      where: { id: parseInt(req.params.id) },
      data: { isLive: false, endedAt: new Date() },
      include: { _count: { select: { logs: true } } },
    });
    return successResponse(res, session, 'Session stopped');
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

// GET /api/heart-rate/live - Get current live session data
router.get('/live', async (req, res) => {
  try {
    const liveSession = await prisma.heartRateSession.findFirst({
      where: { isLive: true },
      include: {
        logs: { orderBy: { capturedAt: 'desc' }, take: 60 },
      },
    });

    if (!liveSession) {
      return successResponse(res, { isLive: false, session: null, latestBpm: null });
    }

    const latestBpm = liveSession.logs.length > 0 ? liveSession.logs[0].bpm : null;

    return successResponse(res, {
      isLive: true,
      session: liveSession,
      latestBpm,
      dataPoints: liveSession.logs.reverse(),
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
});

module.exports = router;
