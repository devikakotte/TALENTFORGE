import apiClient from './apiClient';

async function listMyJobs(params = {}) {
  const { data } = await apiClient.get('/jobs/mine', { params });
  return { jobs: data.data.jobs, pagination: data.meta?.pagination };
}

async function getMyJob(jobId) {
  const { data } = await apiClient.get(`/jobs/mine/${jobId}`);
  return data.data.job;
}

async function createJob(payload) {
  const { data } = await apiClient.post('/jobs/mine', payload);
  return data.data.job;
}

async function updateJob(jobId, payload) {
  const { data } = await apiClient.patch(`/jobs/mine/${jobId}`, payload);
  return data.data.job;
}

async function publishJob(jobId) {
  const { data } = await apiClient.patch(`/jobs/mine/${jobId}/publish`);
  return data.data.job;
}

async function closeJob(jobId) {
  const { data } = await apiClient.patch(`/jobs/mine/${jobId}/close`);
  return data.data.job;
}

async function deleteJob(jobId) {
  const { data } = await apiClient.delete(`/jobs/mine/${jobId}`);
  return data;
}

async function getMyJobStats() {
  const { data } = await apiClient.get('/jobs/mine/stats');
  return data.data.stats;
}

export default {
  listMyJobs,
  getMyJob,
  createJob,
  updateJob,
  publishJob,
  closeJob,
  deleteJob,
  getMyJobStats,
};
