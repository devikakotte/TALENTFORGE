/**
 * Wraps an async Express route/controller so any rejected promise is
 * forwarded to next(), reaching the centralized error handler instead
 * of crashing the process or requiring a try/catch in every controller.
 */
function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = catchAsync;
