const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/ApiResponse');
const candidateProfileService = require('../services/candidateProfile.service');

const getMyProfile = catchAsync(async (req, res) => {
  const profile = await candidateProfileService.getOrCreateProfile(req.user._id);
  sendResponse(res, 200, 'Candidate profile retrieved', { profile });
});

const updateMyProfile = catchAsync(async (req, res) => {
  const profile = await candidateProfileService.updateProfile(req.user._id, req.body);
  sendResponse(res, 200, 'Profile updated successfully', { profile });
});

const uploadResume = catchAsync(async (req, res) => {
  const profile = await candidateProfileService.uploadResume(req.user._id, req.file);
  sendResponse(res, 200, 'Resume uploaded successfully', { profile });
});

const deleteResume = catchAsync(async (req, res) => {
  const profile = await candidateProfileService.deleteResume(req.user._id);
  sendResponse(res, 200, 'Resume removed successfully', { profile });
});

const uploadProfilePhoto = catchAsync(async (req, res) => {
  const profile = await candidateProfileService.uploadProfilePhoto(req.user._id, req.file);
  sendResponse(res, 200, 'Profile photo uploaded successfully', { profile });
});

function subdocumentHandlers(collectionName) {
  return {
    add: catchAsync(async (req, res) => {
      const profile = await candidateProfileService.addSubdocument(
        req.user._id,
        collectionName,
        req.body,
      );
      sendResponse(res, 201, `${collectionName} entry added`, { profile });
    }),
    update: catchAsync(async (req, res) => {
      const profile = await candidateProfileService.updateSubdocument(
        req.user._id,
        collectionName,
        req.params.itemId,
        req.body,
      );
      sendResponse(res, 200, `${collectionName} entry updated`, { profile });
    }),
    remove: catchAsync(async (req, res) => {
      const profile = await candidateProfileService.removeSubdocument(
        req.user._id,
        collectionName,
        req.params.itemId,
      );
      sendResponse(res, 200, `${collectionName} entry removed`, { profile });
    }),
  };
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  deleteResume,
  uploadProfilePhoto,
  education: subdocumentHandlers('education'),
  experience: subdocumentHandlers('experience'),
  certifications: subdocumentHandlers('certifications'),
};
