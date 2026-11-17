const Notification = require('../models/Notification');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { sendEmail } = require('../utils/emailService');
const { buildEmailTemplate } = require('../utils/emailTemplates/buildEmailTemplate');
const env = require('../config/env');

/**
 * Creates the in-app notification record and, best-effort, emails the
 * recipient the same update. Email delivery failures are logged but
 * never block the in-app notification or the caller's main action
 * (e.g. a status change should succeed even if SMTP is down).
 */
async function notify({ recipientId, type, title, message, link, relatedJob, relatedApplication }) {
  const notification = await Notification.create({
    recipient: recipientId,
    type,
    title,
    message,
    link,
    relatedJob,
    relatedApplication,
  });

  const recipient = await User.findById(recipientId).select('email fullName');
  if (recipient) {
    await sendEmail({
      to: recipient.email,
      subject: title,
      html: buildEmailTemplate({
        title,
        bodyLines: [`Hi ${recipient.fullName},`, message],
        ctaText: link ? 'View details' : undefined,
        ctaUrl: link ? `${env.clientUrl}${link}` : undefined,
      }),
    });
  }

  return notification;
}

async function listMyNotifications(userId, { isRead, page = 1, limit = 20 }) {
  const query = { recipient: userId };
  if (isRead !== undefined) query.isRead = isRead === 'true' || isRead === true;

  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(query),
  ]);

  return {
    notifications,
    pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / limit) },
  };
}

async function getUnreadCount(userId) {
  const count = await Notification.countDocuments({ recipient: userId, isRead: false });
  return { unreadCount: count };
}

async function markAsRead(notificationId, userId) {
  const notification = await Notification.findOne({ _id: notificationId, recipient: userId });
  if (!notification) {
    throw ApiError.notFound('Notification not found');
  }
  if (!notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }
  return notification;
}

async function markAllAsRead(userId) {
  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() },
  );
}

module.exports = {
  notify,
  listMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
