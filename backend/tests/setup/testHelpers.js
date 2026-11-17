const request = require('supertest');
const app = require('../../src/app');
const CandidateProfile = require('../../src/models/CandidateProfile');
const CompanyProfile = require('../../src/models/CompanyProfile');
const Job = require('../../src/models/Job');

let userCounter = 0;

/**
 * Registers a new user through the real /auth/register endpoint (so
 * password hashing, token issuance, etc. are exercised exactly as in
 * production) and returns the access token plus the created user.
 */
async function registerAndLogin({ role = 'candidate', ...overrides } = {}) {
  userCounter += 1;
  const email = overrides.email || `test-user-${userCounter}-${Date.now()}@example.com`;

  const response = await request(app)
    .post('/api/v1/auth/register')
    .send({
      fullName: overrides.fullName || 'Test User',
      email,
      password: overrides.password || 'Password123',
      role,
    });

  return {
    accessToken: response.body.data.accessToken,
    user: response.body.data.user,
    response,
  };
}

function authHeader(accessToken) {
  return { Authorization: `Bearer ${accessToken}` };
}

/**
 * Gives a candidate a resume on file directly via the model, bypassing
 * the real Cloudinary upload flow (which needs live credentials) - used
 * wherever a test only needs "this candidate has a resume", not to test
 * the upload endpoint itself.
 */
async function giveCandidateResume(userId) {
  await CandidateProfile.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      resume: {
        url: 'https://res.cloudinary.com/test/resume.pdf',
        publicId: 'test-resume',
        originalFileName: 'resume.pdf',
        uploadedAt: new Date(),
      },
    },
    { upsert: true },
  );
}

/**
 * Creates a company + open job directly against the DB for a given
 * recruiter user id, bypassing the HTTP layer for test setup speed.
 */
async function createOpenJob(recruiterId, overrides = {}) {
  const company = await CompanyProfile.findOneAndUpdate(
    { owner: recruiterId },
    { owner: recruiterId, companyName: overrides.companyName || 'Test Co' },
    { upsert: true, new: true },
  );

  const job = await Job.create({
    recruiter: recruiterId,
    company: company._id,
    title: overrides.title || 'Software Engineer',
    description: overrides.description || 'A great job description that is long enough.',
    category: overrides.category || 'engineering',
    jobType: overrides.jobType || 'full-time',
    experienceLevel: overrides.experienceLevel || 'mid',
    skills: overrides.skills || ['JavaScript', 'Node.js'],
    status: overrides.status || 'open',
    publishedAt: new Date(),
  });

  return { job, company };
}

module.exports = { registerAndLogin, authHeader, giveCandidateResume, createOpenJob };
