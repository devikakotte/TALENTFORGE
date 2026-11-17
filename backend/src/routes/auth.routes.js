const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validateRequest');
const authRateLimiter = require('../middleware/authRateLimiter');
const { authenticate } = require('../middleware/auth');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require('../validators/auth.validator');

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  registerValidator,
  validateRequest,
  authController.register,
);

router.post('/login', authRateLimiter, loginValidator, validateRequest, authController.login);

router.post('/refresh', authController.refresh);

router.post('/logout', authenticate, authController.logout);

router.post(
  '/forgot-password',
  authRateLimiter,
  forgotPasswordValidator,
  validateRequest,
  authController.forgotPassword,
);

router.post(
  '/reset-password',
  authRateLimiter,
  resetPasswordValidator,
  validateRequest,
  authController.resetPassword,
);

router.patch(
  '/change-password',
  authenticate,
  changePasswordValidator,
  validateRequest,
  authController.changePassword,
);

router.get('/verify-email/:token', authController.verifyEmail);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
