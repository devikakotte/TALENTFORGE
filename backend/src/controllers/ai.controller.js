const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/ApiResponse');
const aiService = require('../services/ai.service');

const analyzeResume = catchAsync(async (req, res) => {
  const analysis = await aiService.analyzeResume(req.user._id);
  sendResponse(res, 200, 'Resume analysis complete', { analysis });
});

const getSavedResumeAnalysis = catchAsync(async (req, res) => {
  const analysis = await aiService.getSavedResumeAnalysis(req.user._id);
  sendResponse(res, 200, 'Saved resume analysis retrieved', { analysis });
});

const generateResumeDraft = catchAsync(async (req, res) => {
  const result = await aiService.generateResumeDraft(req.user._id);
  sendResponse(res, 200, 'Resume draft generated', result);
});

const getJobRecommendations = catchAsync(async (req, res) => {
  const recommendations = await aiService.getJobRecommendations(req.user._id, req.query.limit);
  sendResponse(res, 200, 'Job recommendations generated', { recommendations });
});

const getCareerSuggestions = catchAsync(async (req, res) => {
  const suggestions = await aiService.getCareerSuggestions(req.user._id);
  sendResponse(res, 200, 'Career suggestions generated', { suggestions });
});

const getSavedCareerSuggestions = catchAsync(async (req, res) => {
  const suggestions = await aiService.getSavedCareerSuggestions(req.user._id);
  sendResponse(res, 200, 'Saved career suggestions retrieved', { suggestions });
});

const getInterviewPrep = catchAsync(async (req, res) => {
  const prep = await aiService.getInterviewPrep(req.user._id, req.params.jobId);
  sendResponse(res, 200, 'Interview preparation generated', { prep });
});

const generateSkillQuiz = catchAsync(async (req, res) => {
  const quiz = await aiService.generateSkillQuiz(req.user._id, req.params.skill);
  sendResponse(res, 201, 'Quiz generated', { quiz });
});

const parseResume = catchAsync(async (req, res) => {
  const result = await aiService.parseResume(req.user._id);
  sendResponse(res, 200, 'Resume parsed', { result });
});

const getAtsScore = catchAsync(async (req, res) => {
  const result = await aiService.getAtsScore(req.user._id, req.body.jobDescription);
  sendResponse(res, 200, 'Job-specific ATS analysis complete', { result });
});

const getSkillGaps = catchAsync(async (req, res) => {
  const result = await aiService.getSkillGaps(req.user._id, req.query.targetRole, req.query.jobId);
  sendResponse(res, 200, 'Skill gap analysis complete', { result });
});

const getReadiness = catchAsync(async (req, res) => {
  const result = await aiService.getReadiness(req.user._id, req.query.targetRole, req.query.jobId);
  sendResponse(res, 200, 'Readiness score calculated', { result });
});

const getRoadmap = catchAsync(async (req, res) => {
  const result = await aiService.getRoadmap(req.user._id, req.query.targetRole, req.query.jobId);
  sendResponse(res, 200, 'Learning roadmap generated', { result });
});

const askCareerAssistant = catchAsync(async (req, res) => {
  const result = await aiService.askCareerAssistant(req.user._id, req.body.question);
  sendResponse(res, 200, 'Career assistant response generated', { result });
});

const rankCandidatesForJob = catchAsync(async (req, res) => {
  const result = await aiService.rankCandidatesForJob(req.user._id, req.params.jobId);
  sendResponse(res, 200, 'AI candidate ranking generated', { result });
});

const submitSkillQuiz = catchAsync(async (req, res) => {
  const result = await aiService.submitSkillQuiz(req.user._id, req.params.quizId, req.body.answers);
  sendResponse(res, 200, result.passed ? 'Skill verified!' : 'Quiz submitted', { result });
});

module.exports = {
  analyzeResume,
  getSavedResumeAnalysis,
  generateResumeDraft,
  getJobRecommendations,
  getCareerSuggestions,
  getSavedCareerSuggestions,
  getInterviewPrep,
  generateSkillQuiz,
  submitSkillQuiz,
  getAtsScore,
  getSkillGaps,
  getReadiness,
  getRoadmap,
  askCareerAssistant,
  rankCandidatesForJob,
  parseResume,
};
