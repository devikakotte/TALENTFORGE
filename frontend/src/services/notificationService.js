import apiClient from './apiClient';

async function listMyNotifications(params = {}) {
  const { data } = await apiClient.get('/notifications', { params });
  return { notifications: data.data.notifications, pagination: data.meta?.pagination };
}

async function getUnreadCount() {
  const { data } = await apiClient.get('/notifications/unread-count');
  return data.data.unreadCount;
}

async function markAsRead(notificationId) {
  const { data } = await apiClient.patch(`/notifications/${notificationId}/read`);
  return data.data.notification;
}

async function markAllAsRead() {
  const { data } = await apiClient.patch('/notifications/read-all');
  return data;
}

export default { listMyNotifications, getUnreadCount, markAsRead, markAllAsRead };
