const User = require('../models/User');
const CompanyProfile = require('../models/CompanyProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');

// --- User management ---

async function listUsers({ role, isActive, search, page = 1, limit = 20 }) {
  const query = {};
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true' || isActive === true;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(query),
  ]);

  return {
    users,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
}

async function setUserActiveStatus(userId, isActive) {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  if (user.role === 'admin') {
    throw ApiError.forbidden('Admin accounts cannot be deactivated from this panel');
  }
  user.isActive = isActive;
  // Deactivating also invalidates any existing session immediately.
  if (!isActive) {
    user.refreshTokenHash = undefined;
  }
  // password (required, select:false) wasn't loaded above, so a normal
  // save() would fail full-document validation on a field that's
  // actually present in the DB - just not on this in-memory document.
  await user.save({ validateBeforeSave: false });
  return user;
}

// --- Company verification ---

async function listCompanies({ isVerified, search, page = 1, limit = 20 }) {
  const query = {};
  if (isVerified !== undefined) query.isVerified = isVerified === 'true' || isVerified === true;
  if (search) query.companyName = { $regex: search, $options: 'i' };

  const skip = (page - 1) * limit;
  const [companies, total] = await Promise.all([
    CompanyProfile.find(query).populate('owner', 'fullName email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    CompanyProfile.countDocuments(query),
  ]);

  return {
    companies,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
}

async function verifyCompany(companyId) {
  const company = await CompanyProfile.findById(companyId);
  if (!company) {
    throw ApiError.notFound('Company not found');
  }
  company.isVerified = true;
  company.verifiedAt = new Date();
  await company.save();
  return company;
}

async function unverifyCompany(companyId) {
  const company = await CompanyProfile.findById(companyId);
  if (!company) {
    throw ApiError.notFound('Company not found');
  }
  company.isVerified = false;
  company.verifiedAt = undefined;
  await company.save();
  return company;
}

// --- Job moderation ---

async function listJobsForModeration({ status, search, page = 1, limit = 20 }) {
  const query = {};
  if (status) query.status = status;
  if (search) query.title = { $regex: search, $options: 'i' };

  const skip = (page - 1) * limit;
  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate('company', 'companyName isVerified')
      .populate('recruiter', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Job.countDocuments(query),
  ]);

  return {
    jobs,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Admin override to remove a job from the marketplace regardless of
 * ownership - distinct from a recruiter's own closeJob in job.service.js,
 * which only that recruiter can call.
 */
async function moderateCloseJob(jobId) {
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }
  job.status = 'closed';
  job.closedAt = new Date();
  await job.save();
  return job;
}

async function deleteJob(jobId) {
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }
  await job.deleteOne();
}

// --- Platform analytics ---

async function getPlatformAnalytics() {
  const [userCounts, companyCounts, jobCounts, applicationCounts] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    CompanyProfile.aggregate([{ $group: { _id: '$isVerified', count: { $sum: 1 } } }]),
    Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const usersByRole = { candidate: 0, recruiter: 0, admin: 0 };
  userCounts.forEach((entry) => {
    usersByRole[entry._id] = entry.count;
  });

  const companiesByVerification = { verified: 0, unverified: 0 };
  companyCounts.forEach((entry) => {
    if (entry._id) companiesByVerification.verified = entry.count;
    else companiesByVerification.unverified = entry.count;
  });

  const jobsByStatus = { draft: 0, open: 0, closed: 0 };
  jobCounts.forEach((entry) => {
    jobsByStatus[entry._id] = entry.count;
  });

  const applicationsByStatus = { applied: 0, shortlisted: 0, rejected: 0, hired: 0, withdrawn: 0 };
  applicationCounts.forEach((entry) => {
    applicationsByStatus[entry._id] = entry.count;
  });

  return {
    usersByRole,
    totalUsers: Object.values(usersByRole).reduce((sum, n) => sum + n, 0),
    companiesByVerification,
    totalCompanies: Object.values(companiesByVerification).reduce((sum, n) => sum + n, 0),
    jobsByStatus,
    totalJobs: Object.values(jobsByStatus).reduce((sum, n) => sum + n, 0),
    applicationsByStatus,
    totalApplications: Object.values(applicationsByStatus).reduce((sum, n) => sum + n, 0),
  };
}

module.exports = {
  listUsers,
  setUserActiveStatus,
  listCompanies,
  verifyCompany,
  unverifyCompany,
  listJobsForModeration,
  moderateCloseJob,
  deleteJob,
  getPlatformAnalytics,
};
