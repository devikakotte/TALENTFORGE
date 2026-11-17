import apiClient from './apiClient';

async function register(payload) {
  const { data } = await apiClient.post('/auth/register', payload);
  return data.data;
}

async function login(payload) {
  const { data } = await apiClient.post('/auth/login', payload);
  return data.data;
}

async function logout() {
  const { data } = await apiClient.post('/auth/logout');
  return data;
}

async function refresh() {
  const { data } = await apiClient.post('/auth/refresh');
  return data.data;
}

async function forgotPassword(email) {
  const { data } = await apiClient.post('/auth/forgot-password', { email });
  return data;
}

async function resetPassword({ token, password }) {
  const { data } = await apiClient.post('/auth/reset-password', { token, password });
  return data;
}

async function getCurrentUser() {
  const { data } = await apiClient.get('/auth/me');
  return data.data;
}

export default {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  getCurrentUser,
};
