const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/ApiResponse');
const { durationToMs } = require('../utils/tokenService');
const env = require('../config/env');
const authService = require('../services/auth.service');

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProduction,
  // Frontend (Vercel) and backend (Render) live on different domains,
  // so this is a genuinely cross-site request from the browser's
  // perspective. Neither 'strict' nor 'lax' ever sends a cookie on a
  // cross-site fetch/XHR (only 'lax' allows top-level GET navigations,
  // which a credentialed axios call is not) - 'none' is required, and
  // browsers mandate 'secure: true' whenever sameSite is 'none'.
  sameSite: env.isProduction ? 'none' : 'lax',
  path: `${env.apiPrefix}/auth`,
  maxAge: durationToMs(env.jwt.refreshExpiresIn),
};

function setRefreshCookie(res, refreshToken) {
  res.cookie(env.jwt.cookieName, refreshToken, REFRESH_COOKIE_OPTIONS);
}

function clearRefreshCookie(res) {
  res.clearCookie(env.jwt.cookieName, { ...REFRESH_COOKIE_OPTIONS, maxAge: undefined });
}

const register = catchAsync(async (req, res) => {
  const { fullName, email, password, role } = req.body;
  const { user, accessToken, refreshToken } = await authService.register({
    fullName,
    email,
    password,
    role,
  });

  setRefreshCookie(res, refreshToken);
  sendResponse(res, 201, 'Registration successful. Please check your email to verify your account.', {
    user,
    accessToken,
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login({ email, password });

  setRefreshCookie(res, refreshToken);
  sendResponse(res, 200, 'Login successful', { user, accessToken });
});

const refresh = catchAsync(async (req, res) => {
  const rawRefreshToken = req.cookies?.[env.jwt.cookieName];
  const { user, accessToken, refreshToken } = await authService.refreshSession(rawRefreshToken);

  setRefreshCookie(res, refreshToken);
  sendResponse(res, 200, 'Session refreshed', { user, accessToken });
});

const logout = catchAsync(async (req, res) => {
  if (req.user) {
    await authService.logout(req.user._id);
  }
  clearRefreshCookie(res);
  sendResponse(res, 200, 'Logged out successfully');
});

const forgotPassword = catchAsync(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  sendResponse(res, 200, 'If that email is registered, a reset link has been sent.');
});

const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword({ token, password });
  sendResponse(res, 200, 'Password has been reset successfully. Please log in.');
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword({
    userId: req.user._id,
    currentPassword,
    newPassword,
  });
  clearRefreshCookie(res);
  sendResponse(res, 200, 'Password changed successfully. Please log in again.');
});

const verifyEmail = catchAsync(async (req, res) => {
  const user = await authService.verifyEmail(req.params.token);
  sendResponse(res, 200, 'Email verified successfully', { user });
});

const getCurrentUser = catchAsync(async (req, res) => {
  sendResponse(res, 200, 'Current user retrieved', { user: req.user.toSafeJSON() });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  getCurrentUser,
  verifyEmail,
};
