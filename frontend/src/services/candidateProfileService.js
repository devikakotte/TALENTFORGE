import apiClient from './apiClient';

async function getMyProfile() {
  const { data } = await apiClient.get('/candidates/me');
  return data.data.profile;
}

async function updateMyProfile(payload) {
  const { data } = await apiClient.patch('/candidates/me', payload);
  return data.data.profile;
}

async function uploadResume(file) {
  const formData = new FormData();
  formData.append('resume', file);
  const { data } = await apiClient.post('/candidates/me/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.profile;
}

async function deleteResume() {
  const { data } = await apiClient.delete('/candidates/me/resume');
  return data.data.profile;
}

async function uploadProfilePhoto(file) {
  const formData = new FormData();
  formData.append('photo', file);
  const { data } = await apiClient.post('/candidates/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data.profile;
}

function buildCollectionApi(collectionName) {
  return {
    add: async (payload) => {
      const { data } = await apiClient.post(`/candidates/me/${collectionName}`, payload);
      return data.data.profile;
    },
    update: async (itemId, payload) => {
      const { data } = await apiClient.put(`/candidates/me/${collectionName}/${itemId}`, payload);
      return data.data.profile;
    },
    remove: async (itemId) => {
      const { data } = await apiClient.delete(`/candidates/me/${collectionName}/${itemId}`);
      return data.data.profile;
    },
  };
}

export default {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  deleteResume,
  uploadProfilePhoto,
  education: buildCollectionApi('education'),
  experience: buildCollectionApi('experience'),
  certifications: buildCollectionApi('certifications'),
};
