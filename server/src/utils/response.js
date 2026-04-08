function successResponse(res, data, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function errorResponse(res, message = 'An error occurred', statusCode = 500, errors = []) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

function validationErrorResponse(res, errors) {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: errors.map(e => ({
      field: e.path || e.param,
      message: e.msg,
    })),
  });
}

module.exports = { successResponse, errorResponse, validationErrorResponse };
