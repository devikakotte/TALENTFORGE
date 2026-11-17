import apiClient from './apiClient';

async function getMyCompany() {
  const { data } = await apiClient.get('/recruiters/me/company');
  return data.data.company;
}

async function updateMyCompany(payload) {
  const { data } = await apiClient.patch('/recruiters/me/company', payload);
  return data.data.company;
}

async function uploadLogo(file) {
  const formData = new FormData();
  formData.append('logo', file);
  const { data } = await apiClient.post('/recruiters/me/company/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.company;
}

async function talentSearch(params = {}) {
  const { data } = await apiClient.get('/recruiters/talent-search', { params });
  return { candidates: data.data.candidates, pagination: data.meta?.pagination };
}

export default { getMyCompany, updateMyCompany, uploadLogo, talentSearch };
