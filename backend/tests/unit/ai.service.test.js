process.env.ANTHROPIC_API_KEY = 'test-key';

jest.mock('@anthropic-ai/sdk', () =>
  jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              summary: 'Solid mid-level engineer.',
              strengths: ['Clear impact statements'],
              weaknesses: ['Missing metrics'],
              suggestions: ['Quantify achievements'],
              atsScore: 78,
            }),
          },
        ],
      }),
    },
  })),
);

const mongoose = require('mongoose');
const dbHandler = require('../setup/dbHandler');
const CandidateProfile = require('../../src/models/CandidateProfile');
const ApiError = require('../../src/utils/ApiError');

// resumeTextExtractor hits the network (fetch) to download the resume -
// mocked so this stays a fast, offline unit test.
jest.mock('../../src/utils/resumeTextExtractor', () => ({
  extractResumeText: jest.fn().mockResolvedValue('Experienced software engineer...'),
}));

const aiService = require('../../src/services/ai.service');

beforeAll(async () => {
  await dbHandler.connect();
});

afterEach(async () => {
  await dbHandler.clearDatabase();
});

afterAll(async () => {
  await dbHandler.closeDatabase();
});

describe('ai.service.analyzeResume', () => {
  it('throws if the candidate has no profile yet', async () => {
    const fakeUserId = new mongoose.Types.ObjectId();
    await expect(aiService.analyzeResume(fakeUserId)).rejects.toThrow(
      'Please complete your candidate profile first',
    );
  });

  it('throws if the candidate has no resume uploaded', async () => {
    const userId = new mongoose.Types.ObjectId();
    await CandidateProfile.create({ user: userId });

    await expect(aiService.analyzeResume(userId)).rejects.toThrow(
      'Please upload a resume before requesting an analysis',
    );
  });

  it('returns and persists a structured analysis when a resume exists', async () => {
    const userId = new mongoose.Types.ObjectId();
    await CandidateProfile.create({
      user: userId,
      resume: { url: 'https://example.com/resume.pdf', originalFileName: 'resume.pdf' },
    });

    const analysis = await aiService.analyzeResume(userId);

    expect(analysis.atsScore).toBe(78);
    expect(analysis.strengths).toContain('Clear impact statements');

    const saved = await aiService.getSavedResumeAnalysis(userId);
    expect(saved.atsScore).toBe(78);
  });
});

describe('ai.service error handling', () => {
  it('wraps provider errors as ApiError.serviceUnavailable', async () => {
    const { getAnthropicClient } = require('../../src/config/ai');
    const client = getAnthropicClient();
    client.messages.create.mockRejectedValueOnce(new Error('provider down'));

    const userId = new mongoose.Types.ObjectId();
    await CandidateProfile.create({
      user: userId,
      resume: { url: 'https://example.com/resume.pdf', originalFileName: 'resume.pdf' },
    });

    await expect(aiService.analyzeResume(userId)).rejects.toBeInstanceOf(ApiError);
  });
});
