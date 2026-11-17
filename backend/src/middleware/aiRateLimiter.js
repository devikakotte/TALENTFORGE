const rateLimit = require('express-rate-limit');
const env = require('../config/env');

const aiRateLimiter = rateLimit({
  windowMs: env.ai.rateLimitWindowMin * 60 * 1000,
  max: env.ai.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'AI feature rate limit reached. Please try again later.',
  },
});

module.exports = aiRateLimiter;
