const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const logger = require('./config/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const routes = require('./routes');

const app = express();

// Behind a reverse proxy (Render's load balancer, or Nginx in other
// setups) in production, needed for
// correct client IPs in rate limiting and secure cookies.
app.set('trust proxy', 1);

// --- Security headers ---
app.use(helmet());

// --- CORS: only allow the configured client origin, with credentials ---
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }),
);

// --- Body parsing ---
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// --- Sanitization against NoSQL injection & XSS ---
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// --- Performance ---
app.use(compression());

// --- HTTP request logging ---
app.use(
  morgan(env.isProduction ? 'combined' : 'dev', {
    stream: logger.stream,
  }),
);

// --- Global rate limiting ---
const globalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMin * 60 * 1000,
  max: env.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(env.apiPrefix, globalLimiter);

// --- Health check (Render's healthCheckPath, see render.yaml) ---
const healthHandler = (req, res) => {
  res.status(200).json({ success: true, message: 'TalentForge API is healthy' });
};
app.get('/health', healthHandler);
app.get(`${env.apiPrefix}/health`, healthHandler);

// --- API routes ---
app.use(env.apiPrefix, routes);

// --- 404 + centralized error handling ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
