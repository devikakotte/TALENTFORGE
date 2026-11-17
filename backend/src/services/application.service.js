const Application = require('../models/Application');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notification.service');
const logger = require('../config/logger');

const WITHDRAWABLE_STATUSES = ['applied', 'shortlisted'];

// --- Candidate side ---

async function applyToJob(candidateId, jobId, { coverLetter } = {}) {
  const job = await Job.findOne({ _id: jobId, status: 'open' });
  if (!job) {
    throw ApiError.notFound('Job not found or is no longer accepting applications');
  }

  const existing = await Application.findOne({ job: jobId, candidate: candidateId });
  if (existing) {
    throw ApiError.conflict('You have already applied to this job');
  }

  const profile = await CandidateProfile.findOne({ user: candidateId });
  if (!profile?.resume?.url) {
    throw ApiError.badRequest('Please upload a resume before applying');
  }

  let application;
  try {
    application = await Application.create({
      job: jobId,
      candidate: candidateId,
      recruiter: job.recruiter,
      coverLetter,
      resumeSnapshot: {
        url: profile.resume.url,
        originalFileName: profile.resume.originalFileName,
      },
    });
  } catch (error) {
    // The unique (job, candidate) index is the final line of defense
    // against a race between the findOne check above and this create.
    if (error.code === 11000) {
      throw ApiError.conflict('You have already applied to this job');
    }
    throw error;
  }

  await Job.updateOne({ _id: jobId }, { $inc: { applicationsCount: 1 } });

  // Best-effort: notification failures should never fail the application
  // submission itself.
  try {
    await notificationService.notify({
      recipientId: job.recruiter,
      type: 'new_applicant',
      title: 'New applicant',
      message: `A candidate applied to "${job.title}"`,
      link: `/recruiter/dashboard/jobs/${job._id}/applicants`,
      relatedJob: job._id,
      relatedApplication: application._id,
    });
  } catch (error) {
    logger.error(`Failed to notify recruiter of new applicant: ${error.message}`);
  }

  return application;
}

async function getOwnedApplicationOrThrow(applicationId, candidateId) {
  const application = await Application.findById(applicationId);
  if (!application) {
    throw ApiError.notFound('Application not found');
  }
  if (application.candidate.toString() !== candidateId.toString()) {
    throw ApiError.forbidden('You do not have permission to access this application');
  }
  return application;
}

async function withdrawApplication(applicationId, candidateId) {
  const application = await getOwnedApplicationOrThrow(applicationId, candidateId);
  if (!WITHDRAWABLE_STATUSES.includes(application.status)) {
    throw ApiError.badRequest(`Cannot withdraw an application with status "${application.status}"`);
  }
  application.transitionTo('withdrawn');
  await application.save();
  return application;
}

async function listMyApplications(candidateId, { status, page = 1, limit = 10 }) {
  const query = { candidate: candidateId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate({ path: 'job', select: 'title company status', populate: { path: 'company', select: 'companyName logo' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Application.countDocuments(query),
  ]);

  return {
    applications,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Application status breakdown for the candidate dashboard (Phase 7).
 */
async function getCandidateStats(candidateId) {
  const statusCounts = await Application.aggregate([
    { $match: { candidate: candidateId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const applicationsByStatus = {
    applied: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0,
    withdrawn: 0,
  };
  statusCounts.forEach((entry) => {
    applicationsByStatus[entry._id] = entry.count;
  });

  const totalApplications = Object.values(applicationsByStatus).reduce((sum, n) => sum + n, 0);

  return { applicationsByStatus, totalApplications };
}

// --- Recruiter side ---

async function getOwnedApplicationForRecruiterOrThrow(applicationId, recruiterId) {
  const application = await Application.findById(applicationId);
  if (!application) {
    throw ApiError.notFound('Application not found');
  }
  if (application.recruiter.toString() !== recruiterId.toString()) {
    throw ApiError.forbidden('You do not have permission to access this application');
  }
  return application;
}

async function listApplicantsForJob(jobId, recruiterId, { status, page = 1, limit = 10 }) {
  const job = await Job.findOne({ _id: jobId, recruiter: recruiterId });
  if (!job) {
    throw ApiError.notFound('Job not found');
  }

  const query = { job: jobId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate({ path: 'candidate', select: 'fullName email' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Application.countDocuments(query),
  ]);

  return {
    applications,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
}

const VALID_RECRUITER_TRANSITIONS = {
  applied: ['shortlisted', 'rejected'],
  shortlisted: ['rejected', 'hired'],
  rejected: [],
  hired: [],
  withdrawn: [],
};

async function updateApplicationStatus(applicationId, recruiterId, newStatus) {
  const application = await getOwnedApplicationForRecruiterOrThrow(applicationId, recruiterId);

  const allowedNext = VALID_RECRUITER_TRANSITIONS[application.status] || [];
  if (!allowedNext.includes(newStatus)) {
    throw ApiError.badRequest(
      `Cannot move an application from "${application.status}" to "${newStatus}"`,
    );
  }

  application.transitionTo(newStatus);
  await application.save();

  try {
    const job = await Job.findById(application.job).select('title');
    await notificationService.notify({
      recipientId: application.candidate,
      type: 'application_status_change',
      title: 'Application update',
      message: `Your application for "${job?.title || 'a job'}" is now ${newStatus}`,
      link: '/candidate/dashboard/applications',
      relatedJob: application.job,
      relatedApplication: application._id,
    });
  } catch (error) {
    logger.error(`Failed to notify candidate of status change: ${error.message}`);
  }

  return application;
}

module.exports = {
  applyToJob,
  withdrawApplication,
  listMyApplications,
  getCandidateStats,
  getOwnedApplicationOrThrow,
  listApplicantsForJob,
  updateApplicationStatus,
  getOwnedApplicationForRecruiterOrThrow,
};
