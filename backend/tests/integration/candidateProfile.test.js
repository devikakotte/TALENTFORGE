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

describe('GET /api/v1/candidates/me', () => {
  it('lazily creates and returns a profile for a candidate', async () => {
    const { accessToken } = await registerAndLogin({ role: 'candidate' });

    const response = await request(app).get('/api/v1/candidates/me').set(authHeader(accessToken));

    expect(response.status).toBe(200);
    expect(response.body.data.profile).toBeDefined();
    expect(response.body.data.profile.skills).toEqual([]);
  });

  it('rejects a recruiter from accessing candidate routes', async () => {
    const { accessToken } = await registerAndLogin({ role: 'recruiter' });

    const response = await request(app).get('/api/v1/candidates/me').set(authHeader(accessToken));

    expect(response.status).toBe(403);
  });
});

describe('PATCH /api/v1/candidates/me', () => {
  it('updates headline, bio, and skills', async () => {
    const { accessToken } = await registerAndLogin({ role: 'candidate' });

    const response = await request(app)
      .patch('/api/v1/candidates/me')
      .set(authHeader(accessToken))
      .send({ headline: 'Senior Engineer', bio: 'I build things.', skills: ['React', 'Node.js'] });

    expect(response.status).toBe(200);
    expect(response.body.data.profile.headline).toBe('Senior Engineer');
    expect(response.body.data.profile.skills).toEqual(['React', 'Node.js']);
  });
});

describe('Education sub-document CRUD', () => {
  it('adds, updates, and removes an education entry', async () => {
    const { accessToken } = await registerAndLogin({ role: 'candidate' });

    const addResponse = await request(app)
      .post('/api/v1/candidates/me/education')
      .set(authHeader(accessToken))
      .send({
        institution: 'State University',
        degree: 'BSc Computer Science',
        startDate: '2018-09-01',
        isCurrent: false,
        endDate: '2022-06-01',
      });

    expect(addResponse.status).toBe(201);
    const entry = addResponse.body.data.profile.education[0];
    expect(entry.institution).toBe('State University');

    const updateResponse = await request(app)
      .put(`/api/v1/candidates/me/education/${entry._id}`)
      .set(authHeader(accessToken))
      .send({
        institution: 'State University',
        degree: 'MSc Computer Science',
        startDate: '2018-09-01',
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.profile.education[0].degree).toBe('MSc Computer Science');

    const deleteResponse = await request(app)
      .delete(`/api/v1/candidates/me/education/${entry._id}`)
      .set(authHeader(accessToken));

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.profile.education).toHaveLength(0);
  });
});
