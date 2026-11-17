const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const env = require('../config/env');

const { Schema } = mongoose;

const ROLES = ['candidate', 'recruiter', 'admin'];

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ROLES,
      default: 'candidate',
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerificationTokenHash: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    refreshTokenHash: {
      type: String,
      select: false,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ role: 1 });

// --- Password hashing ---
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, env.bcryptSaltRounds);
  if (!this.isNew) {
    // Invalidate tokens issued before a password change.
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Returns true if the JWT was issued before the user's most recent
 * password change - used to reject stale access tokens after a reset.
 */
userSchema.methods.wasPasswordChangedAfter = function wasPasswordChangedAfter(jwtIssuedAtSeconds) {
  if (!this.passwordChangedAt) return false;
  const changedAtSeconds = Math.floor(this.passwordChangedAt.getTime() / 1000);
  return jwtIssuedAtSeconds < changedAtSeconds;
};

/**
 * Generates a random token, returns the raw value (sent to the user via
 * email) while storing only its SHA-256 hash on the document (defense in
 * depth: a leaked database dump can't be used to reset accounts).
 */
function generateAndHashToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
}

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const { rawToken, hashedToken } = generateAndHashToken();
  this.passwordResetTokenHash = hashedToken;
  this.passwordResetExpires = new Date(
    Date.now() + env.resetPasswordTokenExpiresMin * 60 * 1000,
  );
  return rawToken;
};

userSchema.methods.createEmailVerificationToken = function createEmailVerificationToken() {
  const { rawToken, hashedToken } = generateAndHashToken();
  this.emailVerificationTokenHash = hashedToken;
  this.emailVerificationExpires = new Date(
    Date.now() + env.emailVerificationTokenExpiresHours * 60 * 60 * 1000,
  );
  return rawToken;
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    fullName: this.fullName,
    email: this.email,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    createdAt: this.createdAt,
  };
};

userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('User', userSchema);
