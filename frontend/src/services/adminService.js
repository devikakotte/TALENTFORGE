import apiClient from './apiClient';

async function getPlatformAnalytics() {
  const { data } = await apiClient.get('/admin/analytics');
  return data.data.analytics;
}

async function listUsers(params = {}) {
  const { data } = await apiClient.get('/admin/users', { params });
  return { users: data.data.users, pagination: data.meta?.pagination };
}

async function setUserActiveStatus(userId, isActive) {
  const { data } = await apiClient.patch(`/admin/users/${userId}/active`, { isActive });
  return data.data.user;
}

async function listCompanies(params = {}) {
  const { data } = await apiClient.get('/admin/companies', { params });
  return { companies: data.data.companies, pagination: data.meta?.pagination };
}

async function verifyCompany(companyId) {
  const { data } = await apiClient.patch(`/admin/companies/${companyId}/verify`);
  return data.data.company;
}

async function unverifyCompany(companyId) {
  const { data } = await apiClient.patch(`/admin/companies/${companyId}/unverify`);
  return data.data.company;
}

async function listJobsForModeration(params = {}) {
  const { data } = await apiClient.get('/admin/jobs', { params });
  return { jobs: data.data.jobs, pagination: data.meta?.pagination };
}

async function moderateCloseJob(jobId) {
  const { data } = await apiClient.patch(`/admin/jobs/${jobId}/close`);
  return data.data.job;
}

async function deleteJob(jobId) {
  const { data } = await apiClient.delete(`/admin/jobs/${jobId}`);
  return data;
}

export default {
  getPlatformAnalytics,
  listUsers,
  setUserActiveStatus,
  listCompanies,
  verifyCompany,
  unverifyCompany,
  listJobsForModeration,
  moderateCloseJob,
  deleteJob,
};
