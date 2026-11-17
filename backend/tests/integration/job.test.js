const request = require('supertest');
const app = require('../../src/app');
const dbHandler = require('../setup/dbHandler');
const { registerAndLogin, authHeader, createOpenJob } = require('../setup/testHelpers');

beforeAll(async () => {
  await dbHandler.connect();
});

afterEach(async () => {
  await dbHandler.clearDatabase();
});

afterAll(async () => {
  await dbHandler.closeDatabase();
});

describe('Recruiter job CRUD (/api/v1/jobs/mine)', () => {
  it('creates a job as a draft', async () => {
    const { accessToken } = await registerAndLogin({ role: 'recruiter' });

    const response = await request(app)
      .post('/api/v1/jobs/mine')
      .set(authHeader(accessToken))
      .send({
        title: 'Backend Engineer',
        description: 'Build and maintain our API services at scale.',
        category: 'engineering',
        jobType: 'full-time',
        experienceLevel: 'mid',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.job.status).toBe('draft');
  });

  it('rejects a candidate from creating a job', async () => {
    const { accessToken } = await registerAndLogin({ role: 'candidate' });

    const response = await request(app)
      .post('/api/v1/jobs/mine')
      .set(authHeader(accessToken))
      .send({
        title: 'Backend Engineer',
        description: 'Build and maintain our API services at scale.',
        category: 'engineering',
        jobType: 'full-time',
        experienceLevel: 'mid',
      });

    expect(response.status).toBe(403);
  });

  it('publishes then closes a job, and blocks edits once closed', async () => {
    const { accessToken, user } = await registerAndLogin({ role: 'recruiter' });
    const { job } = await createOpenJob(user.id, { status: 'draft' });

    const publishResponse = await request(app)
      .patch(`/api/v1/jobs/mine/${job._id}/publish`)
      .set(authHeader(accessToken));
    expect(publishResponse.status).toBe(200);
    expect(publishResponse.body.data.job.status).toBe('open');

    const closeResponse = await request(app)
      .patch(`/api/v1/jobs/mine/${job._id}/close`)
      .set(authHeader(accessToken));
    expect(closeResponse.status).toBe(200);
    expect(closeResponse.body.data.job.status).toBe('closed');

    const editResponse = await request(app)
      .patch(`/api/v1/jobs/mine/${job._id}`)
      .set(authHeader(accessToken))
      .send({ title: 'New Title' });
    expect(editResponse.status).toBe(400);
  });

  it("prevents a recruiter from managing another recruiter's job", async () => {
    const owner = await registerAndLogin({ role: 'recruiter' });
    const intruder = await registerAndLogin({ role: 'recruiter' });
    const { job } = await createOpenJob(owner.user.id);

    const response = await request(app)
      .patch(`/api/v1/jobs/mine/${job._id}`)
      .set(authHeader(intruder.accessToken))
      .send({ title: 'Hijacked' });

    expect(response.status).toBe(403);
  });
});

describe('Public job marketplace (/api/v1/jobs)', () => {
  it('only returns open jobs, never drafts or closed jobs', async () => {
    const { user } = await registerAndLogin({ role: 'recruiter' });
    await createOpenJob(user.id, { title: 'Open Job', status: 'open' });
    await createOpenJob(user.id, { title: 'Draft Job', status: 'draft' });
    await createOpenJob(user.id, { title: 'Closed Job', status: 'closed' });

    const response = await request(app).get('/api/v1/jobs');

    expect(response.status).toBe(200);
    const titles = response.body.data.jobs.map((job) => job.title);
    expect(titles).toContain('Open Job');
    expect(titles).not.toContain('Draft Job');
    expect(titles).not.toContain('Closed Job');
  });

  it('increments the view count on job details', async () => {
    const { user } = await registerAndLogin({ role: 'recruiter' });
    const { job } = await createOpenJob(user.id);

    const response = await request(app).get(`/api/v1/jobs/${job._id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.job.viewsCount).toBe(1);
  });

  it('filters by category', async () => {
    const { user } = await registerAndLogin({ role: 'recruiter' });
    await createOpenJob(user.id, { title: 'Eng Job', category: 'engineering' });
    await createOpenJob(user.id, { title: 'Design Job', category: 'design' });

    const response = await request(app).get('/api/v1/jobs').query({ category: 'design' });

    expect(response.status).toBe(200);
    expect(response.body.data.jobs).toHaveLength(1);
    expect(response.body.data.jobs[0].title).toBe('Design Job');
  });
});
