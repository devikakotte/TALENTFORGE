const { Router } = require('express');
const adminController = require('../controllers/admin.controller');
const validateRequest = require('../middleware/validateRequest');
const { authenticate, authorize } = require('../middleware/auth');
const {
  companyIdValidator,
  jobIdValidator,
  setUserActiveValidator,
  listUsersValidator,
} = require('../validators/admin.validator');

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/analytics', adminController.getPlatformAnalytics);

// --- Users ---
router.get('/users', listUsersValidator, validateRequest, adminController.listUsers);
router.patch(
  '/users/:userId/active',
  setUserActiveValidator,
  validateRequest,
  adminController.setUserActiveStatus,
);

// --- Companies ---
router.get('/companies', adminController.listCompanies);
router.patch(
  '/companies/:companyId/verify',
  companyIdValidator,
  validateRequest,
  adminController.verifyCompany,
);
router.patch(
  '/companies/:companyId/unverify',
  companyIdValidator,
  validateRequest,
  adminController.unverifyCompany,
);

// --- Jobs ---
router.get('/jobs', adminController.listJobsForModeration);
router.patch(
  '/jobs/:jobId/close',
  jobIdValidator,
  validateRequest,
  adminController.moderateCloseJob,
);
router.delete('/jobs/:jobId', jobIdValidator, validateRequest, adminController.deleteJob);

module.exports = router;
