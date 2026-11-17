const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/ApiResponse');
const notificationService = require('../services/notification.service');

const listMyNotifications = catchAsync(async (req, res) => {
  const { isRead, page, limit } = req.query;
  const result = await notificationService.listMyNotifications(req.user._id, { isRead, page, limit });
  sendResponse(
    res,
    200,
    'Notifications retrieved',
    { notifications: result.notifications },
    { pagination: result.pagination },
  );
});

const getUnreadCount = catchAsync(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user._id);
  sendResponse(res, 200, 'Unread count retrieved', result);
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.notificationId, req.user._id);
  sendResponse(res, 200, 'Notification marked as read', { notification });
});

const markAllAsRead = catchAsync(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  sendResponse(res, 200, 'All notifications marked as read');
});

module.exports = { listMyNotifications, getUnreadCount, markAsRead, markAllAsRead };
