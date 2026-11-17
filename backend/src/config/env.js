const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Fails fast if a required environment variable is missing.
 * Prevents the server from booting into a misconfigured, insecure state.
 */
function requireEnv(key, fallback = undefined) {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  mongoUri: requireEnv('MONGO_URI', 'mongodb://127.0.0.1:27017/talentforge'),

  jwt: {
    accessSecret: requireEnv('JWT_ACCESS_SECRET', 'dev_access_secret_change_me'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: requireEnv('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    cookieName: process.env.JWT_COOKIE_NAME || 'tf_refresh_token',
  },

  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,

  resetPasswordTokenExpiresMin: parseInt(process.env.RESET_PASSWORD_TOKEN_EXPIRES_MIN, 10) || 30,
  emailVerificationTokenExpiresHours:
    parseInt(process.env.EMAIL_VERIFICATION_TOKEN_EXPIRES_HOURS, 10) || 24,

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    resumeFolder: process.env.CLOUDINARY_RESUME_FOLDER || 'talentforge/resumes',
    logoFolder: process.env.CLOUDINARY_LOGO_FOLDER || 'talentforge/company-logos',
    profilePhotoFolder: process.env.CLOUDINARY_PROFILE_PHOTO_FOLDER || 'talentforge/profile-photos',
  },

  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || 'TalentForge <no-reply@talentforge.com>',
  },

  rateLimit: {
    windowMin: parseInt(process.env.RATE_LIMIT_WINDOW_MIN, 10) || 15,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    model: process.env.AI_MODEL || 'gemini-3.6-flash',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS, 10) || 2048,
    rateLimitWindowMin: parseInt(process.env.AI_RATE_LIMIT_WINDOW_MIN, 10) || 60,
    rateLimitMaxRequests: parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS, 10) || 20,
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};

const INSECURE_DEV_DEFAULTS = ['dev_access_secret_change_me', 'dev_refresh_secret_change_me'];

/**
 * The dev-default JWT secrets above exist so `npm run dev` works
 * without a .env file. They must never reach production - a leaked or
 * guessable secret is a full auth bypass. Fail fast at boot rather
 * than silently running with a known-insecure signing key.
 */
if (env.isProduction) {
  if (INSECURE_DEV_DEFAULTS.includes(env.jwt.accessSecret) || INSECURE_DEV_DEFAULTS.includes(env.jwt.refreshSecret)) {
    throw new Error(
      'JWT_ACCESS_SECRET / JWT_REFRESH_SECRET are still set to insecure development defaults. ' +
        'Set real, random secrets before running in production.',
    );
  }
}

module.exports = env;
