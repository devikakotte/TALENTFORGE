const ApiError = require('../../src/utils/ApiError');

describe('ApiError', () => {
  it('badRequest sets status 400 and is operational', () => {
    const error = ApiError.badRequest('Bad input', ['detail']);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad input');
    expect(error.details).toEqual(['detail']);
    expect(error.isOperational).toBe(true);
  });

  it('unauthorized sets status 401', () => {
    expect(ApiError.unauthorized().statusCode).toBe(401);
  });

  it('forbidden sets status 403', () => {
    expect(ApiError.forbidden().statusCode).toBe(403);
  });

  it('notFound sets status 404', () => {
    expect(ApiError.notFound().statusCode).toBe(404);
  });

  it('conflict sets status 409', () => {
    expect(ApiError.conflict().statusCode).toBe(409);
  });

  it('serviceUnavailable sets status 503', () => {
    expect(ApiError.serviceUnavailable().statusCode).toBe(503);
  });

  it('internal sets status 500', () => {
    expect(ApiError.internal().statusCode).toBe(500);
  });

  it('defaults message when none provided', () => {
    expect(ApiError.notFound().message).toBe('Resource not found');
  });
});
