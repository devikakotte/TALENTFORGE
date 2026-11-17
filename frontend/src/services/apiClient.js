import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Single Axios instance shared across the app.
 * `withCredentials` allows the refresh-token httpOnly cookie to be sent.
 * The access token is attached per-request from memory (set via
 * setAccessToken), never persisted to localStorage, to reduce XSS risk.
 */
const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken = null;
let onUnauthorized = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof onUnauthorized === 'function') {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default apiClient;
