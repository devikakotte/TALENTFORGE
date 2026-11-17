const { Router } = require('express');
const notificationController = require('../controllers/notification.controller');
const validateRequest = require('../middleware/validateRequest');
const { authenticate } = require('../middleware/auth');
const { notificationIdValidator } = require('../validators/notification.validator');

const router = Router();

router.use(authenticate);

router.get('/', notificationController.listMyNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch(
  '/:notificationId/read',
  notificationIdValidator,
  validateRequest,
  notificationController.markAsRead,
);
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;
