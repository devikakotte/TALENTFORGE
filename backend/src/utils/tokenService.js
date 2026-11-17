const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

/**
 * Converts a duration string like "7d" / "15m" into milliseconds, used
 * for setting the refresh-token cookie's maxAge consistently with its
 * JWT expiry.
 */
function durationToMs(duration) {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 15 * 60 * 1000; // default 15 minutes
  const value = parseInt(match[1], 10);
  const unitMs = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 };
  return value * unitMs[match[2]];
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  durationToMs,
};
