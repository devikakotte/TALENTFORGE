const { Router } = require('express');
const jobController = require('../controllers/job.controller');
const validateRequest = require('../middleware/validateRequest');
const { authenticate, authorize } = require('../middleware/auth');
const {
  createJobValidator,
  updateJobValidator,
  jobIdValidator,
  browseJobsValidator,
} = require('../validators/job.validator');

const router = Router();

/**
 * Recruiter-only routes, namespaced under /mine so the public browsing
 * endpoints below can share this router without path collisions.
 */
router.use('/mine', authenticate, authorize('recruiter'));

router.post('/mine', createJobValidator, validateRequest, jobController.createJob);
router.get('/mine', jobController.listMyJobs);
router.get('/mine/stats', jobController.getMyJobStats);
router.get('/mine/:jobId', jobIdValidator, validateRequest, jobController.getMyJob);
router.patch(
  '/mine/:jobId',
  jobIdValidator,
  updateJobValidator,
  validateRequest,
  jobController.updateJob,
);
router.patch('/mine/:jobId/publish', jobIdValidator, validateRequest, jobController.publishJob);
router.patch('/mine/:jobId/close', jobIdValidator, validateRequest, jobController.closeJob);
router.delete('/mine/:jobId', jobIdValidator, validateRequest, jobController.deleteJob);

/**
 * Public job marketplace (Phase 5) - no authentication required.
 * Specific paths (/featured, /recent) are declared before the generic
 * /:jobId so they aren't swallowed by the id param route.
 */
router.get('/featured', jobController.getFeaturedJobs);
router.get('/recent', jobController.getRecentJobs);
router.get('/', browseJobsValidator, validateRequest, jobController.browseJobs);
router.get('/:jobId', jobIdValidator, validateRequest, jobController.getPublicJobDetails);

module.exports = router;
