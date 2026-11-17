const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/ApiResponse');
const jobService = require('../services/job.service');

const createJob = catchAsync(async (req, res) => {
  const job = await jobService.createJob(req.user._id, req.body);
  sendResponse(res, 201, 'Job created as a draft', { job });
});

const updateJob = catchAsync(async (req, res) => {
  const job = await jobService.updateJob(req.params.jobId, req.user._id, req.body);
  sendResponse(res, 200, 'Job updated', { job });
});

const publishJob = catchAsync(async (req, res) => {
  const job = await jobService.publishJob(req.params.jobId, req.user._id);
  sendResponse(res, 200, 'Job published and visible in the marketplace', { job });
});

const closeJob = catchAsync(async (req, res) => {
  const job = await jobService.closeJob(req.params.jobId, req.user._id);
  sendResponse(res, 200, 'Job closed', { job });
});

const deleteJob = catchAsync(async (req, res) => {
  await jobService.deleteJob(req.params.jobId, req.user._id);
  sendResponse(res, 200, 'Job deleted');
});

const getMyJob = catchAsync(async (req, res) => {
  const job = await jobService.getJobForRecruiter(req.params.jobId, req.user._id);
  sendResponse(res, 200, 'Job retrieved', { job });
});

const listMyJobs = catchAsync(async (req, res) => {
  const { status, page, limit } = req.query;
  const result = await jobService.listMyJobs(req.user._id, { status, page, limit });
  sendResponse(res, 200, 'Jobs retrieved', { jobs: result.jobs }, { pagination: result.pagination });
});

const getMyJobStats = catchAsync(async (req, res) => {
  const stats = await jobService.getRecruiterStats(req.user._id);
  sendResponse(res, 200, 'Recruiter stats retrieved', { stats });
});

// --- Public marketplace endpoints ---

const browseJobs = catchAsync(async (req, res) => {
  const result = await jobService.browseJobs(req.query);
  sendResponse(res, 200, 'Jobs retrieved', { jobs: result.jobs }, { pagination: result.pagination });
});

const getFeaturedJobs = catchAsync(async (req, res) => {
  const jobs = await jobService.getFeaturedJobs(req.query.limit);
  sendResponse(res, 200, 'Featured jobs retrieved', { jobs });
});

const getRecentJobs = catchAsync(async (req, res) => {
  const jobs = await jobService.getRecentJobs(req.query.limit);
  sendResponse(res, 200, 'Recently posted jobs retrieved', { jobs });
});

const getPublicJobDetails = catchAsync(async (req, res) => {
  const { job, relatedJobs } = await jobService.getPublicJobDetails(req.params.jobId);
  sendResponse(res, 200, 'Job details retrieved', { job, relatedJobs });
});

module.exports = {
  createJob,
  updateJob,
  publishJob,
  closeJob,
  deleteJob,
  getMyJob,
  listMyJobs,
  getMyJobStats,
  browseJobs,
  getFeaturedJobs,
  getRecentJobs,
  getPublicJobDetails,
};
