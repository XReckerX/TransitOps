const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => err.msg).join(', ');
    return next(new ApiError(400, extractedErrors));
  }
  next();
};

module.exports = validateRequest;
