const winston = require('winston');
const env = require('./env');

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} [${level}]: ${stack || message}`;
  }),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

const transports = [new winston.transports.Console()];

// File transports are skipped in tests: they'd otherwise fail in CI
// environments where ./logs doesn't exist yet, and test output only
// needs to go to the console.
if (env.nodeEnv !== 'test') {
  transports.push(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  );
}

const logger = winston.createLogger({
  level: env.logLevel,
  format: env.isProduction ? prodFormat : devFormat,
  transports,
  exitOnError: false,
  silent: env.nodeEnv === 'test',
});

/**
 * Stream adapter so morgan (HTTP request logging) can pipe into winston.
 */
logger.stream = {
  write: (message) => logger.info(message.trim()),
};

module.exports = logger;
