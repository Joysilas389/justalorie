const { validationResult } = require('express-validator');
const { validationErrorResponse } = require('../utils/response');

function validate(validations) {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) break;
    }
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    return validationErrorResponse(res, errors.array());
  };
}

module.exports = { validate };
