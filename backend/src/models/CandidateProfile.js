const mongoose = require('mongoose');

const { Schema } = mongoose;

const educationSchema = new Schema(
  {
    institution: { type: String, required: true, trim: true, maxlength: 150 },
    degree: { type: String, required: true, trim: true, maxlength: 150 },
    fieldOfStudy: { type: String, trim: true, maxlength: 150 },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: true, timestamps: false },
);

const experienceSchema = new Schema(
  {
    company: { type: String, required: true, trim: true, maxlength: 150 },
    jobTitle: { type: String, required: true, trim: true, maxlength: 150 },
    location: { type: String, trim: true, maxlength: 150 },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isCurrent: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: 1500 },
  },
  { _id: true, timestamps: false },
);

const certificationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    issuingOrganization: { type: String, required: true, trim: true, maxlength: 150 },
    issueDate: { type: Date },
    expirationDate: { type: Date },
    credentialId: { type: String, trim: true, maxlength: 100 },
    credentialUrl: { type: String, trim: true, maxlength: 500 },
  },
  { _id: true, timestamps: false },
);

const socialLinksSchema = new Schema(
  {
    linkedin: { type: String, trim: true, maxlength: 500 },
    github: { type: String, trim: true, maxlength: 500 },
    portfolio: { type: String, trim: true, maxlength: 500 },
    twitter: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const resumeSchema = new Schema(
  {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
    originalFileName: { type: String, trim: true },
    uploadedAt: { type: Date },
  },
  { _id: false },
);

const candidateProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: { type: String, trim: true, maxlength: 150 },
    bio: { type: String, trim: true, maxlength: 2000 },
    phone: { type: String, trim: true, maxlength: 30 },
    location: { type: String, trim: true, maxlength: 150 },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 50,
        message: 'A candidate can list at most 50 skills',
      },
    },
    verifiedSkills: {
      type: [String],
      default: [],
    },
    isDiscoverable: {
      type: Boolean,
      default: false,
    },
    education: { type: [educationSchema], default: [] },
    experience: { type: [experienceSchema], default: [] },
    certifications: { type: [certificationSchema], default: [] },
    projects: { type: [String], default: [], validate: { validator: (arr) => arr.length <= 30, message: 'A candidate can list at most 30 projects' } },
    achievements: { type: [String], default: [] },
    preferences: { type: [String], default: [] },
    expectedSalary: { type: Number, min: 0 },
    availability: { type: String, trim: true, maxlength: 100 },
    socialLinks: { type: socialLinksSchema, default: () => ({}) },
    resume: { type: resumeSchema, default: () => ({}) },
    profilePhoto: {
      url: { type: String, trim: true },
      publicId: { type: String, trim: true },
    },
    aiResumeAnalysis: {
      strengths: { type: [String], default: undefined },
      weaknesses: { type: [String], default: undefined },
      suggestions: { type: [String], default: undefined },
      atsScore: { type: Number, min: 0, max: 100 },
      summary: { type: String, trim: true, maxlength: 2000 },
      generatedAt: { type: Date },
    },
    aiCareerSuggestions: {
      content: { type: String, trim: true, maxlength: 4000 },
      generatedAt: { type: Date },
    },
    isProfileComplete: { type: Boolean, default: false },
  },
  { timestamps: true },
);

candidateProfileSchema.index({ skills: 1 });
candidateProfileSchema.index({ isDiscoverable: 1, skills: 1 });

/**
 * Derives whether the profile has enough substance to be considered
 * "complete" - used by the frontend to nudge candidates and, later, by
 * recruiter search/filtering.
 */
candidateProfileSchema.pre('save', function markCompletion(next) {
  this.isProfileComplete = Boolean(
    this.headline &&
      this.bio &&
      this.skills.length > 0 &&
      (this.education.length > 0 || this.experience.length > 0) &&
      this.resume?.url,
  );
  next();
});

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
