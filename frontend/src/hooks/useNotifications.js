import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import notificationService from '../services/notificationService';

const NOTIFICATIONS_KEY = ['notifications', 'mine'];
const UNREAD_COUNT_KEY = ['notifications', 'unreadCount'];

export function useNotifications(params = {}) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, params],
    queryFn: () => notificationService.listMyNotifications(params),
    keepPreviousData: true,
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: notificationService.getUnreadCount,
    // Poll so the bell badge updates without a manual refresh.
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
    },
  });
}
