const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/ApiResponse');
const companyProfileService = require('../services/companyProfile.service');
const candidateProfileService = require('../services/candidateProfile.service');

const getMyCompany = catchAsync(async (req, res) => {
  const company = await companyProfileService.getOrCreateCompany(req.user._id);
  sendResponse(res, 200, 'Company profile retrieved', { company });
});

const updateMyCompany = catchAsync(async (req, res) => {
  const company = await companyProfileService.updateCompany(req.user._id, req.body);
  sendResponse(res, 200, 'Company profile updated', { company });
});

const uploadLogo = catchAsync(async (req, res) => {
  const company = await companyProfileService.uploadLogo(req.user._id, req.file);
  sendResponse(res, 200, 'Company logo uploaded', { company });
});

const talentSearch = catchAsync(async (req, res) => {
  const { skills, location, page, limit } = req.query;
  const result = await candidateProfileService.searchDiscoverableCandidates({
    skills,
    location,
    page,
    limit,
  });
  sendResponse(
    res,
    200,
    'Candidates retrieved',
    { candidates: result.candidates },
    { pagination: result.pagination },
  );
});

module.exports = { getMyCompany, updateMyCompany, uploadLogo, talentSearch };
