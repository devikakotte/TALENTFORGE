import apiClient from './apiClient';

async function browseJobs(params = {}) {
  const { data } = await apiClient.get('/jobs', { params });
  return { jobs: data.data.jobs, pagination: data.meta?.pagination };
}

async function getFeaturedJobs(limit = 6) {
  const { data } = await apiClient.get('/jobs/featured', { params: { limit } });
  return data.data.jobs;
}

async function getRecentJobs(limit = 6) {
  const { data } = await apiClient.get('/jobs/recent', { params: { limit } });
  return data.data.jobs;
}

async function getJobDetails(jobId) {
  const { data } = await apiClient.get(`/jobs/${jobId}`);
  return { job: data.data.job, relatedJobs: data.data.relatedJobs };
}

export default { browseJobs, getFeaturedJobs, getRecentJobs, getJobDetails };
