/**
 * Sends a consistent JSON envelope for every successful response so
 * frontend clients can rely on a single shape: { success, message, data, meta }.
 */
function sendResponse(res, statusCode, message, data = null, meta = null) {
  return res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

module.exports = { sendResponse };
