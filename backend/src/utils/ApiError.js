/**
 * Represents a known, "operational" error - one we anticipated
 * (bad input, missing resource, unauthorized action, etc).
 * Distinguishing these from programming bugs lets the global error
 * handler decide what's safe to expose to the client.
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', details = null) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Conflict') {
    return new ApiError(409, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable') {
    return new ApiError(503, message);
  }
}

module.exports = ApiError;
