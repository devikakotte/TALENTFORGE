const { Router } = require('express');
const aiController = require('../controllers/ai.controller');
const { authenticate, authorize } = require('../middleware/auth');
const aiRateLimiter = require('../middleware/aiRateLimiter');
const validateRequest = require('../middleware/validateRequest');
const { jobIdValidator } = require('../validators/job.validator');

const router = Router();
router.use(authenticate, authorize('recruiter'));

router.get('/candidate-ranking/:jobId', aiRateLimiter, jobIdValidator, validateRequest, aiController.rankCandidatesForJob);

module.exports = router;
