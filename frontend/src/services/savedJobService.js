import apiClient from './apiClient';

async function listSavedJobs(params = {}) {
  const { data } = await apiClient.get('/saved-jobs', { params });
  return { savedJobs: data.data.savedJobs, pagination: data.meta?.pagination };
}

async function saveJob(jobId) {
  const { data } = await apiClient.post(`/saved-jobs/${jobId}`);
  return data.data.savedJob;
}

async function unsaveJob(jobId) {
  const { data } = await apiClient.delete(`/saved-jobs/${jobId}`);
  return data;
}

export default { listSavedJobs, saveJob, unsaveJob };
