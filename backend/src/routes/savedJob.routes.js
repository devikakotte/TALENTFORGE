const { Router } = require('express');
const savedJobController = require('../controllers/savedJob.controller');
const validateRequest = require('../middleware/validateRequest');
const { authenticate, authorize } = require('../middleware/auth');
const { jobIdValidator } = require('../validators/job.validator');

const router = Router();

router.use(authenticate, authorize('candidate'));

router.get('/', savedJobController.listSavedJobs);
router.post('/:jobId', jobIdValidator, validateRequest, savedJobController.saveJob);
router.delete('/:jobId', jobIdValidator, validateRequest, savedJobController.unsaveJob);

module.exports = router;
