import apiClient from './apiClient';

async function parseResume() {
  const { data } = await apiClient.post('/ai/resume-parse');
  return data.data.result;
}

async function getCandidateRanking(jobId) {
  const { data } = await apiClient.get(`/ai-recruiter/candidate-ranking/${jobId}`);
  return data.data.result;
}

async function getAtsScore(jobDescription) {
  const { data } = await apiClient.post('/ai/ats-score', { jobDescription });
  return data.data.result;
}
async function getReadiness(params = {}) {
  const { data } = await apiClient.get('/ai/readiness', { params });
  return data.data.result;
}
async function getSkillGaps(params = {}) {
  const { data } = await apiClient.get('/ai/skill-gaps', { params });
  return data.data.result;
}
async function getRoadmap(params = {}) {
  const { data } = await apiClient.get('/ai/roadmap', { params });
  return data.data.result;
}
async function askCareerAssistant(question) {
  const { data } = await apiClient.post('/ai/career-assistant', { question });
  return data.data.result;
}

async function getSavedResumeAnalysis() {
  const { data } = await apiClient.get('/ai/resume-analysis');
  return data.data.analysis;
}

async function analyzeResume() {
  const { data } = await apiClient.post('/ai/resume-analysis');
  return data.data.analysis;
}

async function generateResumeDraft() {
  const { data } = await apiClient.post('/ai/resume-draft');
  return data.data;
}

async function getJobRecommendations(limit = 5) {
  const { data } = await apiClient.get('/ai/job-recommendations', { params: { limit } });
  return data.data.recommendations;
}

async function getSavedCareerSuggestions() {
  const { data } = await apiClient.get('/ai/career-suggestions');
  return data.data.suggestions;
}

async function generateCareerSuggestions() {
  const { data } = await apiClient.post('/ai/career-suggestions');
  return data.data.suggestions;
}

async function getInterviewPrep(jobId) {
  const { data } = await apiClient.get(`/ai/interview-prep/${jobId}`);
  return data.data.prep;
}

async function generateSkillQuiz(skill) {
  const { data } = await apiClient.post(`/ai/skill-quiz/${encodeURIComponent(skill)}`);
  return data.data.quiz;
}

async function submitSkillQuiz(quizId, answers) {
  const { data } = await apiClient.post(`/ai/skill-quiz/${quizId}/submit`, { answers });
  return data.data.result;
}

export default {
  parseResume,
  getCandidateRanking,
  getAtsScore,
  getReadiness,
  getSkillGaps,
  getRoadmap,
  askCareerAssistant,
  getSavedResumeAnalysis,
  analyzeResume,
  generateResumeDraft,
  getJobRecommendations,
  getSavedCareerSuggestions,
  generateCareerSuggestions,
  getInterviewPrep,
  generateSkillQuiz,
  submitSkillQuiz,
};
