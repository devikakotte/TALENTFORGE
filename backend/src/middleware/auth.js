const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { verifyAccessToken } = require('../utils/tokenService');

/**
 * Verifies the Bearer access token, loads the current user, and rejects
 * tokens issued before the user's most recent password change (so a
 * stolen access token becomes invalid the moment the real owner resets
 * their password).
 */
const authenticate = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Authentication token is missing');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token); // throws JsonWebTokenError/TokenExpiredError on failure

  const user = await User.findById(decoded.sub).select(
    '+passwordChangedAt fullName email role isActive isEmailVerified',
  );

  if (!user) {
    throw ApiError.unauthorized('User belonging to this token no longer exists');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated');
  }
  if (user.wasPasswordChangedAfter(decoded.iat)) {
    throw ApiError.unauthorized('Password was changed recently, please log in again');
  }

  req.user = user;
  next();
});

/**
 * Restricts a route to specific roles. Must run after `authenticate`.
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
