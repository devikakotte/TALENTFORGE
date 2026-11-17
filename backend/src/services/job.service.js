const Job = require('../models/Job');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const companyProfileService = require('./companyProfile.service');

const ALLOWED_FIELDS = [
  'title',
  'description',
  'responsibilities',
  'requirements',
  'skills',
  'category',
  'jobType',
  'experienceLevel',
  'location',
  'isRemote',
  'salaryMin',
  'salaryMax',
  'currency',
  'applicationDeadline',
];

function applyAllowedFields(job, updates) {
  ALLOWED_FIELDS.forEach((field) => {
    if (updates[field] !== undefined) {
      job[field] = updates[field];
    }
  });
}

async function createJob(recruiterId, jobData) {
  const company = await companyProfileService.getOrCreateCompany(recruiterId);

  if (jobData.salaryMin && jobData.salaryMax && jobData.salaryMin > jobData.salaryMax) {
    throw ApiError.badRequest('salaryMin cannot be greater than salaryMax');
  }

  const job = new Job({
    recruiter: recruiterId,
    company: company._id,
    status: 'draft',
  });
  applyAllowedFields(job, jobData);
  await job.save();
  return job;
}

/**
 * Loads a job and verifies the requesting recruiter owns it - shared by
 * every mutation so ownership is checked in exactly one place.
 */
async function getOwnedJobOrThrow(jobId, recruiterId) {
  const job = await Job.findById(jobId);
  if (!job) {
    throw ApiError.notFound('Job not found');
  }
  if (job.recruiter.toString() !== recruiterId.toString()) {
    throw ApiError.forbidden('You do not have permission to manage this job');
  }
  return job;
}

async function updateJob(jobId, recruiterId, updates) {
  const job = await getOwnedJobOrThrow(jobId, recruiterId);
  if (job.status === 'closed') {
    throw ApiError.badRequest('Cannot edit a closed job. Reopen it first.');
  }

  const nextSalaryMin = updates.salaryMin ?? job.salaryMin;
  const nextSalaryMax = updates.salaryMax ?? job.salaryMax;
  if (nextSalaryMin && nextSalaryMax && nextSalaryMin > nextSalaryMax) {
    throw ApiError.badRequest('salaryMin cannot be greater than salaryMax');
  }

  applyAllowedFields(job, updates);
  await job.save();
  return job;
}

async function publishJob(jobId, recruiterId) {
  const job = await getOwnedJobOrThrow(jobId, recruiterId);
  if (job.status === 'open') return job;

  job.status = 'open';
  job.publishedAt = job.publishedAt || new Date();
  job.closedAt = undefined;
  await job.save();
  return job;
}

async function closeJob(jobId, recruiterId) {
  const job = await getOwnedJobOrThrow(jobId, recruiterId);
  job.status = 'closed';
  job.closedAt = new Date();
  await job.save();
  return job;
}

async function deleteJob(jobId, recruiterId) {
  const job = await getOwnedJobOrThrow(jobId, recruiterId);
  await job.deleteOne();
}

async function getJobForRecruiter(jobId, recruiterId) {
  return getOwnedJobOrThrow(jobId, recruiterId);
}

async function listMyJobs(recruiterId, { status, page = 1, limit = 10 }) {
  const query = { recruiter: recruiterId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [jobs, total] = await Promise.all([
    Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Job.countDocuments(query),
  ]);

  return {
    jobs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Aggregate stats across every job this recruiter owns - job counts by
 * status, total views/applications, and a breakdown of applications by
 * status - for the recruiter dashboard (Phase 7).
 */
async function getRecruiterStats(recruiterId) {
  const [jobStatusCounts, totals] = await Promise.all([
    Job.aggregate([
      { $match: { recruiter: recruiterId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Job.aggregate([
      { $match: { recruiter: recruiterId } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewsCount' },
          totalApplications: { $sum: '$applicationsCount' },
          totalJobs: { $sum: 1 },
        },
      },
    ]),
  ]);

  const jobsByStatus = { draft: 0, open: 0, closed: 0 };
  jobStatusCounts.forEach((entry) => {
    jobsByStatus[entry._id] = entry.count;
  });

  const applicationStatusCounts = await Application.aggregate([
    { $match: { recruiter: recruiterId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const applicationsByStatus = {
    applied: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
    withdrawn: 0,
  };
  applicationStatusCounts.forEach((entry) => {
    applicationsByStatus[entry._id] = entry.count;
  });

  return {
    jobsByStatus,
    applicationsByStatus,
    totalViews: totals[0]?.totalViews || 0,
    totalApplications: totals[0]?.totalApplications || 0,
    totalJobs: totals[0]?.totalJobs || 0,
  };
}

// --- Public marketplace (Phase 5) ---
// Only ever queries status: 'open' jobs - drafts and closed jobs are
// never visible outside the recruiter's own "Manage Jobs" view.

const PUBLIC_LIST_SORT_OPTIONS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  salaryHigh: { salaryMax: -1 },
  salaryLow: { salaryMin: 1 },
};

function buildPublicQuery({ search, category, jobType, experienceLevel, isRemote, location }) {
  const query = { status: 'open' };

  if (search) {
    query.$text = { $search: search };
  }
  if (category) query.category = category;
  if (jobType) query.jobType = jobType;
  if (experienceLevel) query.experienceLevel = experienceLevel;
  if (isRemote !== undefined) query.isRemote = isRemote === 'true' || isRemote === true;
  if (location) query.location = { $regex: location, $options: 'i' };

  return query;
}

async function browseJobs({
  search,
  category,
  jobType,
  experienceLevel,
  isRemote,
  location,
  sort = 'newest',
  page = 1,
  limit = 12,
}) {
  const query = buildPublicQuery({ search, category, jobType, experienceLevel, isRemote, location });
  const sortOption = PUBLIC_LIST_SORT_OPTIONS[sort] || PUBLIC_LIST_SORT_OPTIONS.newest;
  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate('company', 'companyName logo industry')
      .sort(sortOption)
      .skip(skip)
      .limit(limit),
    Job.countDocuments(query),
  ]);

  return {
    jobs,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getFeaturedJobs(limit = 6) {
  return Job.find({ status: 'open', isFeatured: true })
    .populate('company', 'companyName logo industry')
    .sort({ createdAt: -1 })
    .limit(limit);
}

async function getRecentJobs(limit = 6) {
  return Job.find({ status: 'open' })
    .populate('company', 'companyName logo industry')
    .sort({ createdAt: -1 })
    .limit(limit);
}

async function getRelatedJobs(job, limit = 4) {
  return Job.find({
    status: 'open',
    _id: { $ne: job._id },
    $or: [{ category: job.category }, { skills: { $in: job.skills } }],
  })
    .populate('company', 'companyName logo industry')
    .sort({ createdAt: -1 })
    .limit(limit);
}

/**
 * Public job detail view. Increments the view counter with a single
 * atomic update (not a save() after mutation) so concurrent viewers
 * never race-overwrite each other's increments.
 */
async function getPublicJobDetails(jobId) {
  const job = await Job.findOneAndUpdate(
    { _id: jobId, status: 'open' },
    { $inc: { viewsCount: 1 } },
    { new: true },
  ).populate('company', 'companyName logo industry description website headquarters');

  if (!job) {
    throw ApiError.notFound('Job not found or is no longer accepting applications');
  }

  const relatedJobs = await getRelatedJobs(job);
  return { job, relatedJobs };
}

module.exports = {
  createJob,
  updateJob,
  publishJob,
  closeJob,
  deleteJob,
  getJobForRecruiter,
  listMyJobs,
  getRecruiterStats,
  browseJobs,
  getFeaturedJobs,
  getRecentJobs,
  getPublicJobDetails,
};
