const { Router } = require('express');
const aiController = require('../controllers/ai.controller');
const validateRequest = require('../middleware/validateRequest');
const { authenticate, authorize } = require('../middleware/auth');
const aiRateLimiter = require('../middleware/aiRateLimiter');
const { jobIdValidator, skillParamValidator, submitQuizValidator } = require('../validators/ai.validator');

const router = Router();

router.use(authenticate, authorize('candidate'));

// --- AI command center ---
router.post('/resume-parse', aiRateLimiter, aiController.parseResume);
router.post('/ats-score', aiRateLimiter, aiController.getAtsScore);
router.get('/skill-gaps', aiController.getSkillGaps);
router.get('/readiness', aiController.getReadiness);
router.get('/roadmap', aiRateLimiter, aiController.getRoadmap);
router.post('/career-assistant', aiRateLimiter, aiController.askCareerAssistant);

// --- Resume analysis ---
router.get('/resume-analysis', aiController.getSavedResumeAnalysis);
router.post('/resume-analysis', aiRateLimiter, aiController.analyzeResume);

// --- Resume builder ---
router.post('/resume-draft', aiRateLimiter, aiController.generateResumeDraft);

// --- Job recommendations ---
router.get('/job-recommendations', aiRateLimiter, aiController.getJobRecommendations);

// --- Career suggestions ---
router.get('/career-suggestions', aiController.getSavedCareerSuggestions);
router.post('/career-suggestions', aiRateLimiter, aiController.getCareerSuggestions);

// --- Interview preparation ---
router.get(
  '/interview-prep/:jobId',
  aiRateLimiter,
  jobIdValidator,
  validateRequest,
  aiController.getInterviewPrep,
);

// --- Skill verification quiz ---
router.post(
  '/skill-quiz/:skill',
  aiRateLimiter,
  skillParamValidator,
  validateRequest,
  aiController.generateSkillQuiz,
);
router.post(
  '/skill-quiz/:quizId/submit',
  submitQuizValidator,
  validateRequest,
  aiController.submitSkillQuiz,
);

module.exports = router;
