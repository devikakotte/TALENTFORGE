const rateLimit = require('express-rate-limit');

/**
 * Tighter than the global API rate limiter - applied only to
 * brute-force-sensitive endpoints (login, register, forgot-password,
 * reset-password) to slow down credential-stuffing and enumeration
 * attempts without affecting normal browsing traffic.
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Please try again in a few minutes.',
  },
});

module.exports = authRateLimiter;
