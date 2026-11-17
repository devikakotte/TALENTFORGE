import apiClient from './apiClient';

async function applyToJob(jobId, { coverLetter } = {}) {
  const { data } = await apiClient.post(`/applications/jobs/${jobId}`, { coverLetter });
  return data.data.application;
}

async function withdrawApplication(applicationId) {
  const { data } = await apiClient.patch(`/applications/${applicationId}/withdraw`);
  return data.data.application;
}

async function listMyApplications(params = {}) {
  const { data } = await apiClient.get('/applications/mine', { params });
  return { applications: data.data.applications, pagination: data.meta?.pagination };
}

async function listApplicantsForJob(jobId, params = {}) {
  const { data } = await apiClient.get(`/applications/job/${jobId}`, { params });
  return { applications: data.data.applications, pagination: data.meta?.pagination };
}

async function updateApplicationStatus(applicationId, status) {
  const { data } = await apiClient.patch(`/applications/${applicationId}/status`, { status });
  return data.data.application;
}

async function getMyApplicationStats() {
  const { data } = await apiClient.get('/applications/mine/stats');
  return data.data.stats;
}

export default {
  applyToJob,
  withdrawApplication,
  listMyApplications,
  getMyApplicationStats,
  listApplicantsForJob,
  updateApplicationStatus,
};
