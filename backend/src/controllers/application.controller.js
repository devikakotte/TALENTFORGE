const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/ApiResponse');
const applicationService = require('../services/application.service');

// --- Candidate side ---

const applyToJob = catchAsync(async (req, res) => {
  const application = await applicationService.applyToJob(req.user._id, req.params.jobId, {
    coverLetter: req.body.coverLetter,
  });
  sendResponse(res, 201, 'Application submitted', { application });
});

const withdrawApplication = catchAsync(async (req, res) => {
  const application = await applicationService.withdrawApplication(
    req.params.applicationId,
    req.user._id,
  );
  sendResponse(res, 200, 'Application withdrawn', { application });
});

const listMyApplications = catchAsync(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await applicationService.listMyApplications(req.user._id, { status, page, limit });
  sendResponse(
    res,
    200,
    'Applications retrieved',
    { applications: result.applications },
    { pagination: result.pagination },
  );
});

const getMyApplicationStats = catchAsync(async (req, res) => {
  const stats = await applicationService.getCandidateStats(req.user._id);
  sendResponse(res, 200, 'Application stats retrieved', { stats });
});

// --- Recruiter side ---

const listApplicantsForJob = catchAsync(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await applicationService.listApplicantsForJob(req.params.jobId, req.user._id, {
    status,
    page,
    limit,
  });
  sendResponse(
    res,
    200,
    'Applicants retrieved',
    { applications: result.applications },
    { pagination: result.pagination },
  );
});

const updateApplicationStatus = catchAsync(async (req, res) => {
  const application = await applicationService.updateApplicationStatus(
    req.params.applicationId,
    req.user._id,
    req.body.status,
  );
  sendResponse(res, 200, `Application marked as ${application.status}`, { application });
});

module.exports = {
  applyToJob,
  withdrawApplication,
  listMyApplications,
  getMyApplicationStats,
  listApplicantsForJob,
  updateApplicationStatus,
};
