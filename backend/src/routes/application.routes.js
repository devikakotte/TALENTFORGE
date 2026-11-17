const { Router } = require('express');
const applicationController = require('../controllers/application.controller');
const validateRequest = require('../middleware/validateRequest');
const { authenticate, authorize } = require('../middleware/auth');
const {
  applyToJobValidator,
  applicationIdValidator,
  updateApplicationStatusValidator,
} = require('../validators/application.validator');
const { jobIdValidator } = require('../validators/job.validator');

const router = Router();

router.use(authenticate);

// --- Candidate side ---
router.post(
  '/jobs/:jobId',
  authorize('candidate'),
  applyToJobValidator,
  validateRequest,
  applicationController.applyToJob,
);
router.get('/mine', authorize('candidate'), applicationController.listMyApplications);
router.get('/mine/stats', authorize('candidate'), applicationController.getMyApplicationStats);
router.patch(
  '/:applicationId/withdraw',
  authorize('candidate'),
  applicationIdValidator,
  validateRequest,
  applicationController.withdrawApplication,
);

// --- Recruiter side ---
router.get(
  '/job/:jobId',
  authorize('recruiter'),
  jobIdValidator,
  validateRequest,
  applicationController.listApplicantsForJob,
);
router.patch(
  '/:applicationId/status',
  authorize('recruiter'),
  updateApplicationStatusValidator,
  validateRequest,
  applicationController.updateApplicationStatus,
);

module.exports = router;
