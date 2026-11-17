export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  CANDIDATE_DASHBOARD: '/candidate/dashboard',
  RECRUITER_DASHBOARD: '/recruiter/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  JOBS: '/jobs',
  JOB_DETAILS: '/jobs/:jobId',
  NOT_FOUND: '*',
};

export const USER_ROLES = {
  CANDIDATE: 'candidate',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
};

export const STORAGE_KEYS = {
  THEME: 'tf_theme',
};

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'TalentForge';

export function getDashboardRouteForRole(role) {
  if (role === USER_ROLES.RECRUITER) return ROUTES.RECRUITER_DASHBOARD;
  if (role === USER_ROLES.ADMIN) return ROUTES.ADMIN_DASHBOARD;
  return ROUTES.CANDIDATE_DASHBOARD;
}
