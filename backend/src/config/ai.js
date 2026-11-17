const { GoogleGenAI } = require('@google/genai');
const env = require('./env');
const ApiError = require('../utils/ApiError');

let client;

/**
 * Returns a shared Gemini client, or throws a clear 503 if the Gemini key
 * isn't configured. The client is created lazily so the rest of the API can
 * still boot when AI is disabled.
 */
function getGeminiClient() {
  if (!env.ai.geminiApiKey) {
    throw ApiError.serviceUnavailable(
      'AI features are not configured on this server. Set GEMINI_API_KEY to enable them.',
    );
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.ai.geminiApiKey });
  }
  return client;
}

module.exports = { getGeminiClient };
