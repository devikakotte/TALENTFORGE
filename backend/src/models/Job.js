const mongoose = require('mongoose');

const { Schema } = mongoose;

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'internship', 'remote'];
const EXPERIENCE_LEVELS = ['entry', 'mid', 'senior', 'lead', 'executive'];
const JOB_STATUSES = ['draft', 'open', 'closed'];
const JOB_CATEGORIES = [
  'engineering',
  'design',
  'product',
  'marketing',
  'sales',
  'customer-support',
  'operations',
  'finance',
  'hr',
  'other',
];

const jobSchema = new Schema(
  {
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'CompanyProfile',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      maxlength: 8000,
    },
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    category: {
      type: String,
      enum: JOB_CATEGORIES,
      required: true,
    },
    jobType: {
      type: String,
      enum: JOB_TYPES,
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: EXPERIENCE_LEVELS,
      required: true,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    isRemote: { type: Boolean, default: false },
    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    currency: { type: String, trim: true, default: 'USD', maxlength: 10 },
    applicationDeadline: { type: Date },
    status: {
      type: String,
      enum: JOB_STATUSES,
      default: 'draft',
    },
    isFeatured: { type: Boolean, default: false },
    viewsCount: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },
    publishedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true },
);

// Supports the Job Marketplace (Phase 5): full-text search across
// title/description/skills, plus common filter combinations.
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ status: 1, category: 1, jobType: 1, experienceLevel: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ recruiter: 1, status: 1 });

jobSchema.pre('save', function setSlug(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = `${this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}-${this._id.toString().slice(-6)}`;
  }
  next();
});

jobSchema.statics.JOB_TYPES = JOB_TYPES;
jobSchema.statics.EXPERIENCE_LEVELS = EXPERIENCE_LEVELS;
jobSchema.statics.JOB_STATUSES = JOB_STATUSES;
jobSchema.statics.JOB_CATEGORIES = JOB_CATEGORIES;

module.exports = mongoose.model('Job', jobSchema);
