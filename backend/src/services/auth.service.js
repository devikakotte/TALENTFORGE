const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { sendEmail } = require('../utils/emailService');
const { buildEmailTemplate } = require('../utils/emailTemplates/buildEmailTemplate');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/tokenService');
const env = require('../config/env');

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function issueTokenPair(user) {
  const payload = { sub: user._id.toString(), role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

async function register({ fullName, email, password, role }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = new User({
    fullName,
    email,
    password,
    role: role || 'candidate',
  });

  const verificationToken = user.createEmailVerificationToken();
  await user.save();

  const verificationUrl = `${env.clientUrl}/verify-email/${verificationToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Verify your TalentForge email address',
    html: buildEmailTemplate({
      title: 'Welcome to TalentForge',
      bodyLines: [
        `Hi ${user.fullName},`,
        'Please confirm your email address to activate your account.',
      ],
      ctaText: 'Verify Email',
      ctaUrl: verificationUrl,
    }),
  });

  const tokens = issueTokenPair(user);
  user.refreshTokenHash = hashToken(tokens.refreshToken);
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return { user: user.toSafeJSON(), ...tokens };
}

async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password +refreshTokenHash');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been deactivated');
  }

  const tokens = issueTokenPair(user);
  user.refreshTokenHash = hashToken(tokens.refreshToken);
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  return { user: user.toSafeJSON(), ...tokens };
}

async function refreshSession(rawRefreshToken) {
  if (!rawRefreshToken) {
    throw ApiError.unauthorized('Refresh token is missing');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch (error) {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.sub).select('+refreshTokenHash');
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Invalid session');
  }

  // Reject if the presented refresh token doesn't match the one on file -
  // catches stolen/replayed tokens after a legitimate rotation.
  if (user.refreshTokenHash !== hashToken(rawRefreshToken)) {
    throw ApiError.unauthorized('Session has been invalidated, please log in again');
  }

  const tokens = issueTokenPair(user);
  user.refreshTokenHash = hashToken(tokens.refreshToken);
  await user.save({ validateBeforeSave: false });

  return { user: user.toSafeJSON(), ...tokens };
}

async function logout(userId) {
  await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
}

async function forgotPassword(email) {
  const user = await User.findOne({ email });
  // Always respond as if successful to avoid leaking which emails are
  // registered (user enumeration).
  if (!user) return;

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${env.clientUrl}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Reset your TalentForge password',
    html: buildEmailTemplate({
      title: 'Reset your password',
      bodyLines: [
        `Hi ${user.fullName},`,
        `This link expires in ${env.resetPasswordTokenExpiresMin} minutes. If you didn't request this, you can safely ignore this email.`,
      ],
      ctaText: 'Reset Password',
      ctaUrl: resetUrl,
    }),
    critical: true,
  });
}

async function resetPassword({ token, password }) {
  const hashedToken = hashToken(token);
  const user = await User.findOne({
    passwordResetTokenHash: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select('+passwordResetTokenHash +passwordResetExpires');

  if (!user) {
    throw ApiError.badRequest('Password reset token is invalid or has expired');
  }

  user.password = password;
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokenHash = undefined; // force re-login on all devices
  await user.save();
}

async function verifyEmail(token) {
  const hashedToken = hashToken(token);
  const user = await User.findOne({
    emailVerificationTokenHash: hashedToken,
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationTokenHash +emailVerificationExpires');
  if (!user) throw ApiError.badRequest('Email verification link is invalid or has expired');
  user.isEmailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });
  return user.toSafeJSON();
}

async function changePassword({ userId, currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw ApiError.unauthorized('Current password is incorrect');
  }

  user.password = newPassword;
  user.refreshTokenHash = undefined; // force re-login on all devices
  await user.save();
}

module.exports = {
  register,
  login,
  refreshSession,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
};
