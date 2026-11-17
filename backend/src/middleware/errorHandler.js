const env = require('../config/env');
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

/**
 * Normalizes known third-party/library errors (Mongoose validation,
 * duplicate keys, invalid ObjectIds, JWT errors) into ApiError so the
 * response shape stays consistent regardless of where the error came from.
 */
function normalizeError(err) {
  if (err instanceof ApiError) return err;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    return ApiError.badRequest('Validation failed', details);
  }

  // Mongoose invalid ObjectId cast
  if (err.name === 'CastError') {
    return ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiError.conflict(`Duplicate value for field: ${field}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiError.unauthorized('Invalid authentication token');
  }
  if (err.name === 'TokenExpiredError') {
    return ApiError.unauthorized('Authentication token has expired');
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    const messages = {
      LIMIT_FILE_SIZE: 'File is too large',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field in upload',
    };
    return ApiError.badRequest(messages[err.code] || `File upload error: ${err.message}`);
  }

  // Unknown / programming error - do not leak details in production
  return ApiError.internal(env.isProduction ? 'Internal server error' : err.message);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const normalized = normalizeError(err);

  if (!normalized.isOperational || normalized.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${err.stack || err.message}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${normalized.message}`);
  }

  res.status(normalized.statusCode).json({
    success: false,
    message: normalized.message,
    ...(normalized.details ? { errors: normalized.details } : {}),
    ...(env.isProduction ? {} : { stack: err.stack }),
  });
}

function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = { errorHandler, notFoundHandler };
