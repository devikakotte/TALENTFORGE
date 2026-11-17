const request = require('supertest');
const app = require('../../src/app');
const dbHandler = require('../setup/dbHandler');
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

describe('POST /api/v1/auth/register', () => {
  it('creates a candidate account and returns an access token', async () => {
    const { response } = await registerAndLogin({ role: 'candidate' });

    expect(response.status).toBe(201);
    expect(response.body.data.user.role).toBe('candidate');
    expect(response.body.data.accessToken).toEqual(expect.any(String));
    expect(response.body.data.user.password).toBeUndefined();
  });

  it('rejects a duplicate email', async () => {
    const email = 'duplicate@example.com';
    await registerAndLogin({ email });
    const { response } = await registerAndLogin({ email });

    expect(response.status).toBe(409);
  });

  it('rejects an admin role from public registration', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Would-be Admin',
      email: 'admin-attempt@example.com',
      password: 'Password123',
      role: 'admin',
    });

    expect(response.status).toBe(400);
  });

  it('rejects a weak password', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Weak Password',
      email: 'weak@example.com',
      password: 'short',
      role: 'candidate',
    });

    expect(response.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const email = 'login-test@example.com';
    const password = 'Password123';
    await registerAndLogin({ email, password });

    const response = await request(app).post('/api/v1/auth/login').send({ email, password });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toEqual(expect.any(String));
  });

  it('rejects an incorrect password', async () => {
    const email = 'wrong-pass@example.com';
    await registerAndLogin({ email, password: 'Password123' });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPassword1' });

    expect(response.status).toBe(401);
  });

  it('rejects a non-existent email', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'Password123' });

    expect(response.status).toBe(401);
  });
});

describe('GET /api/v1/auth/me', () => {
  it('returns the current user for a valid token', async () => {
    const { accessToken, user } = await registerAndLogin();

    const response = await request(app).get('/api/v1/auth/me').set(authHeader(accessToken));

    expect(response.status).toBe(200);
    expect(response.body.data.user.id).toBe(user.id);
  });

  it('rejects a request with no token', async () => {
    const response = await request(app).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
  });

  it('rejects a malformed token', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not-a-real-token');

    expect(response.status).toBe(401);
  });
});
