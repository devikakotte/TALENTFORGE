const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/ApiResponse');
const adminService = require('../services/admin.service');

// --- Users ---

const listUsers = catchAsync(async (req, res) => {
  const { role, isActive, search, page, limit } = req.query;
  const result = await adminService.listUsers({ role, isActive, search, page, limit });
  sendResponse(res, 200, 'Users retrieved', { users: result.users }, { pagination: result.pagination });
});

const setUserActiveStatus = catchAsync(async (req, res) => {
  const user = await adminService.setUserActiveStatus(req.params.userId, req.body.isActive);
  sendResponse(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'}`, {
    user: user.toSafeJSON(),
  });
});

// --- Companies ---

const listCompanies = catchAsync(async (req, res) => {
  const { isVerified, search, page, limit } = req.query;
  const result = await adminService.listCompanies({ isVerified, search, page, limit });
  sendResponse(
    res,
    200,
    'Companies retrieved',
    { companies: result.companies },
    { pagination: result.pagination },
  );
});

const verifyCompany = catchAsync(async (req, res) => {
  const company = await adminService.verifyCompany(req.params.companyId);
  sendResponse(res, 200, 'Company verified', { company });
});

const unverifyCompany = catchAsync(async (req, res) => {
  const company = await adminService.unverifyCompany(req.params.companyId);
  sendResponse(res, 200, 'Company verification revoked', { company });
});

// --- Jobs ---

const listJobsForModeration = catchAsync(async (req, res) => {
  const { status, search, page, limit } = req.query;
  const result = await adminService.listJobsForModeration({ status, search, page, limit });
  sendResponse(res, 200, 'Jobs retrieved', { jobs: result.jobs }, { pagination: result.pagination });
});

const moderateCloseJob = catchAsync(async (req, res) => {
  const job = await adminService.moderateCloseJob(req.params.jobId);
  sendResponse(res, 200, 'Job closed by moderation', { job });
});

const deleteJob = catchAsync(async (req, res) => {
  await adminService.deleteJob(req.params.jobId);
  sendResponse(res, 200, 'Job deleted by moderation');
});

// --- Analytics ---

const getPlatformAnalytics = catchAsync(async (req, res) => {
  const analytics = await adminService.getPlatformAnalytics();
  sendResponse(res, 200, 'Platform analytics retrieved', { analytics });
});

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
