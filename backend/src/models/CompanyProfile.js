const mongoose = require('mongoose');

const { Schema } = mongoose;

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

const companyProfileSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 150,
    },
    industry: { type: String, trim: true, maxlength: 100 },
    companySize: { type: String, enum: COMPANY_SIZES },
    website: { type: String, trim: true, maxlength: 300 },
    description: { type: String, trim: true, maxlength: 3000 },
    headquarters: { type: String, trim: true, maxlength: 150 },
    foundedYear: { type: Number, min: 1800, max: new Date().getFullYear() },
    logo: {
      url: { type: String, trim: true },
      publicId: { type: String, trim: true },
    },
    socialLinks: {
      linkedin: { type: String, trim: true, maxlength: 500 },
      twitter: { type: String, trim: true, maxlength: 500 },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: { type: Date },
  },
  { timestamps: true },
);

companyProfileSchema.index({ companyName: 'text' });

companyProfileSchema.statics.COMPANY_SIZES = COMPANY_SIZES;

module.exports = mongoose.model('CompanyProfile', companyProfileSchema);
