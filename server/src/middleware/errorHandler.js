const { errorResponse } = require('../utils/response');

function notFoundHandler(req, res) {
  return errorResponse(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
}

function errorHandler(err, req, res, _next) {
  console.error('Unhandled error:', err);

  if (err.code === 'P2002') {
    return errorResponse(res, 'A record with that value already exists', 409);
  }
  if (err.code === 'P2025') {
    return errorResponse(res, 'Record not found', 404);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  return errorResponse(res, message, statusCode);
}

module.exports = { notFoundHandler, errorHandler };
