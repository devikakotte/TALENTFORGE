const request = require('supertest');
const app = require('../../src/app');
const dbHandler = require('../setup/dbHandler');
const {
  registerAndLogin,
  authHeader,
  createOpenJob,
  giveCandidateResume,
} = require('../setup/testHelpers');

beforeAll(async () => {
  await dbHandler.connect();
});

afterEach(async () => {
  await dbHandler.clearDatabase();
});

afterAll(async () => {
  await dbHandler.closeDatabase();
});

describe('POST /api/v1/applications/jobs/:jobId', () => {
  it('rejects applying without an uploaded resume', async () => {
    const recruiter = await registerAndLogin({ role: 'recruiter' });
    const candidate = await registerAndLogin({ role: 'candidate' });
    const { job } = await createOpenJob(recruiter.user.id);

    const response = await request(app)
      .post(`/api/v1/applications/jobs/${job._id}`)
      .set(authHeader(candidate.accessToken));

    expect(response.status).toBe(400);
  });

  it('applies successfully with a resume on file', async () => {
    const recruiter = await registerAndLogin({ role: 'recruiter' });
    const candidate = await registerAndLogin({ role: 'candidate' });
    const { job } = await createOpenJob(recruiter.user.id);
    await giveCandidateResume(candidate.user.id);

    const response = await request(app)
      .post(`/api/v1/applications/jobs/${job._id}`)
      .set(authHeader(candidate.accessToken))
      .send({ coverLetter: 'I would love to work here.' });

    expect(response.status).toBe(201);
    expect(response.body.data.application.status).toBe('applied');
  });

  it('prevents applying to the same job twice', async () => {
    const recruiter = await registerAndLogin({ role: 'recruiter' });
    const candidate = await registerAndLogin({ role: 'candidate' });
    const { job } = await createOpenJob(recruiter.user.id);
    await giveCandidateResume(candidate.user.id);

    await request(app)
      .post(`/api/v1/applications/jobs/${job._id}`)
      .set(authHeader(candidate.accessToken));

    const response = await request(app)
      .post(`/api/v1/applications/jobs/${job._id}`)
      .set(authHeader(candidate.accessToken));

    expect(response.status).toBe(409);
  });
});

describe('Recruiter application review flow', () => {
  async function applyToJob() {
    const recruiter = await registerAndLogin({ role: 'recruiter' });
    const candidate = await registerAndLogin({ role: 'candidate' });
    const { job } = await createOpenJob(recruiter.user.id);
    await giveCandidateResume(candidate.user.id);

    const applyResponse = await request(app)
      .post(`/api/v1/applications/jobs/${job._id}`)
      .set(authHeader(candidate.accessToken));

    return { recruiter, candidate, job, application: applyResponse.body.data.application };
  }

  it('allows shortlist then hire, in order', async () => {
    const { recruiter, application } = await applyToJob();

    const shortlistResponse = await request(app)
      .patch(`/api/v1/applications/${application._id}/status`)
      .set(authHeader(recruiter.accessToken))
      .send({ status: 'shortlisted' });
    expect(shortlistResponse.status).toBe(200);

    const hireResponse = await request(app)
      .patch(`/api/v1/applications/${application._id}/status`)
      .set(authHeader(recruiter.accessToken))
      .send({ status: 'hired' });
    expect(hireResponse.status).toBe(200);
    expect(hireResponse.body.data.application.status).toBe('hired');
  });

  it('rejects skipping straight from applied to hired', async () => {
    const { recruiter, application } = await applyToJob();

    const response = await request(app)
      .patch(`/api/v1/applications/${application._id}/status`)
      .set(authHeader(recruiter.accessToken))
      .send({ status: 'hired' });

    expect(response.status).toBe(400);
  });

  it("prevents a different recruiter from reviewing another recruiter's applicant", async () => {
    const { application } = await applyToJob();
    const intruder = await registerAndLogin({ role: 'recruiter' });

    const response = await request(app)
      .patch(`/api/v1/applications/${application._id}/status`)
      .set(authHeader(intruder.accessToken))
      .send({ status: 'shortlisted' });

    expect(response.status).toBe(403);
  });

  it('lets the candidate withdraw an active application', async () => {
    const { candidate, application } = await applyToJob();

    const response = await request(app)
      .patch(`/api/v1/applications/${application._id}/withdraw`)
      .set(authHeader(candidate.accessToken));

    expect(response.status).toBe(200);
    expect(response.body.data.application.status).toBe('withdrawn');
  });
});
