const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Runs after a route's validator chain. Collects express-validator
 * errors into a flat list of messages and forwards a single
 * ApiError.badRequest so every validation failure across the API
 * returns the same response shape.
 */
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const messages = errors.array().map((err) => err.msg);
  return next(ApiError.badRequest('Validation failed', messages));
}

module.exports = validateRequest;
