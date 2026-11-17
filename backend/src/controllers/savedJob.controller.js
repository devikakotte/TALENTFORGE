const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/ApiResponse');
const savedJobService = require('../services/savedJob.service');

const saveJob = catchAsync(async (req, res) => {
  const savedJob = await savedJobService.saveJob(req.user._id, req.params.jobId);
  sendResponse(res, 201, 'Job saved', { savedJob });
});

const unsaveJob = catchAsync(async (req, res) => {
  await savedJobService.unsaveJob(req.user._id, req.params.jobId);
  sendResponse(res, 200, 'Job removed from saved list');
});

const listSavedJobs = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const result = await savedJobService.listSavedJobs(req.user._id, { page, limit });
  sendResponse(
    res,
    200,
    'Saved jobs retrieved',
    { savedJobs: result.savedJobs },
    { pagination: result.pagination },
  );
});

module.exports = { saveJob, unsaveJob, listSavedJobs };
