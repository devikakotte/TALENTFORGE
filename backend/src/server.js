const env = require('./config/env');
const logger = require('./config/logger');
const { connectDatabase, disconnectDatabase } = require('./config/database');
const app = require('./app');

let server;

async function start() {
  await connectDatabase();

  server = app.listen(env.port, () => {
    logger.info(`TalentForge API running in ${env.nodeEnv} mode on port ${env.port}`);
  });
}

async function shutdown(signal) {
  logger.info(`${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await disconnectDatabase();
      logger.info('HTTP server closed. Database disconnected.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason?.stack || reason}`);
  // Fail fast on unhandled rejections rather than continuing in an
  // unknown state.
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.stack || error.message}`);
  process.exit(1);
});

start();
