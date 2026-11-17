const { Router } = require('express');

const router = Router();

// Feature routers are mounted here as each phase is implemented.
router.use('/auth', require('./auth.routes'));
router.use('/candidates', require('./candidateProfile.routes'));
router.use('/recruiters', require('./recruiter.routes'));
router.use('/jobs', require('./job.routes'));
router.use('/applications', require('./application.routes'));
router.use('/saved-jobs', require('./savedJob.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/ai', require('./ai.routes'));
router.use('/ai-recruiter', require('./aiRecruiter.routes'));

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TalentForge API root - see /health for status',
  });
});

module.exports = router;
