const request = require('supertest');
const app = require('../../src/app');
const dbHandler = require('../setup/dbHandler');
const User = require('../../src/models/User');
const { registerAndLogin, authHeader } = require('../setup/testHelpers');

beforeAll(async () => {
  await dbHandler.connect();
});

afterEach(async () => {
  await dbHandler.clearDatabase();
});

afterAll(async () => {
  await dbHandler.closeDatabase();
});

/**
 * Admins can't self-register (see auth.test.js), so tests create the
 * admin user directly against the model, then log in through the real
 * endpoint to get a valid token.
 */
async function loginAsAdmin() {
  const email = `admin-${Date.now()}@example.com`;
  const password = 'Password123';
  await User.create({ fullName: 'Test Admin', email, password, role: 'admin', isEmailVerified: true });

  const response = await request(app).post('/api/v1/auth/login').send({ email, password });
  return response.body.data.accessToken;
}

describe('Admin route protection', () => {
  it('rejects a candidate from accessing admin routes', async () => {
    const { accessToken } = await registerAndLogin({ role: 'candidate' });

    const response = await request(app).get('/api/v1/admin/analytics').set(authHeader(accessToken));

    expect(response.status).toBe(403);
  });

  it('rejects an unauthenticated request', async () => {
    const response = await request(app).get('/api/v1/admin/users');
    expect(response.status).toBe(401);
  });

  it('allows an admin to access analytics', async () => {
    const adminToken = await loginAsAdmin();

    const response = await request(app).get('/api/v1/admin/analytics').set(authHeader(adminToken));

    expect(response.status).toBe(200);
    expect(response.body.data.analytics.totalUsers).toBeGreaterThanOrEqual(1);
  });
});

describe('Admin user management', () => {
  it('deactivates a user', async () => {
    const adminToken = await loginAsAdmin();
    const { user } = await registerAndLogin({ role: 'candidate' });

    const response = await request(app)
      .patch(`/api/v1/admin/users/${user.id}/active`)
      .set(authHeader(adminToken))
      .send({ isActive: false });

    expect(response.status).toBe(200);
    expect(response.body.data.user.isActive).toBe(false);
  });

  it('refuses to deactivate an admin account via this endpoint', async () => {
    const adminToken = await loginAsAdmin();
    const targetAdmin = await User.create({
      fullName: 'Other Admin',
      email: `other-admin-${Date.now()}@example.com`,
      password: 'Password123',
      role: 'admin',
    });

    const response = await request(app)
      .patch(`/api/v1/admin/users/${targetAdmin._id}/active`)
      .set(authHeader(adminToken))
      .send({ isActive: false });

    expect(response.status).toBe(403);
  });
});
