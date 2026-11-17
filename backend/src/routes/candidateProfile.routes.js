const { Router } = require('express');
const candidateProfileController = require('../controllers/candidateProfile.controller');
const aiController = require('../controllers/ai.controller');
const validateRequest = require('../middleware/validateRequest');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadResume: uploadResumeMiddleware, uploadImage } = require('../middleware/uploadMiddleware');
const {
  updateProfileValidator,
  educationValidator,
  experienceValidator,
  certificationValidator,
  subdocumentIdValidator,
} = require('../validators/candidateProfile.validator');

const router = Router();

// Every route here is restricted to authenticated candidates.
router.use(authenticate, authorize('candidate'));

router.get('/me', candidateProfileController.getMyProfile);
router.get('/readiness', aiController.getReadiness);
router.get('/skill-gaps', aiController.getSkillGaps);
router.get('/roadmap', aiController.getRoadmap);
router.patch('/me', updateProfileValidator, validateRequest, candidateProfileController.updateMyProfile);

router.post(
  '/me/resume',
  uploadResumeMiddleware.single('resume'),
  candidateProfileController.uploadResume,
);
router.delete('/me/resume', candidateProfileController.deleteResume);

router.post(
  '/me/photo',
  uploadImage.single('photo'),
  candidateProfileController.uploadProfilePhoto,
);

// --- Education ---
router.post('/me/education', educationValidator, validateRequest, candidateProfileController.education.add);
router.put(
  '/me/education/:itemId',
  subdocumentIdValidator,
  educationValidator,
  validateRequest,
  candidateProfileController.education.update,
);
router.delete(
  '/me/education/:itemId',
  subdocumentIdValidator,
  validateRequest,
  candidateProfileController.education.remove,
);

// --- Experience ---
router.post('/me/experience', experienceValidator, validateRequest, candidateProfileController.experience.add);
router.put(
  '/me/experience/:itemId',
  subdocumentIdValidator,
  experienceValidator,
  validateRequest,
  candidateProfileController.experience.update,
);
router.delete(
  '/me/experience/:itemId',
  subdocumentIdValidator,
  validateRequest,
  candidateProfileController.experience.remove,
);

// --- Certifications ---
router.post(
  '/me/certifications',
  certificationValidator,
  validateRequest,
  candidateProfileController.certifications.add,
);
router.put(
  '/me/certifications/:itemId',
  subdocumentIdValidator,
  certificationValidator,
  validateRequest,
  candidateProfileController.certifications.update,
);
router.delete(
  '/me/certifications/:itemId',
  subdocumentIdValidator,
  validateRequest,
  candidateProfileController.certifications.remove,
);

module.exports = router;
