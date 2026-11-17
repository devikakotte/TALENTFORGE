const mongoose = require('mongoose');
const env = require('./env');
const logger = require('./logger');

mongoose.set('strictQuery', true);

/**
 * Establishes the MongoDB connection.
 * Exits the process on initial connection failure since the API is
 * non-functional without a database - fail fast rather than serve
 * broken requests.
 */
async function connectDatabase() {
  try {
    await mongoose.connect(env.mongoUri, {
      autoIndex: !env.isProduction,
    });
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB connection lost.');
  });

  mongoose.connection.on('error', (error) => {
    logger.error(`MongoDB connection error: ${error.message}`);
  });
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase };
