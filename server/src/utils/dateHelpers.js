function getLocalDateKey(date = new Date()) {
  const d = new Date(date);
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

function getDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function parseCustomDateRange(startStr, endStr) {
  const start = new Date(startStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endStr);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

module.exports = { getLocalDateKey, getDateRange, parseCustomDateRange };
