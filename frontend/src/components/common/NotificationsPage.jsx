import { Link } from 'react-router-dom';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../../hooks/useNotifications';
import LoadingScreen from '../common/LoadingScreen';

function NotificationsPage() {
  const { data, isLoading } = useNotifications({ limit: 30 });
  const { data: unreadCount } = useUnreadNotificationCount();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  if (isLoading) return <LoadingScreen label="Loading notifications..." />;

  const notifications = data?.notifications || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Status updates on your jobs and applications.
          </p>
        </div>
        {unreadCount > 0 && (
          <button type="button" onClick={() => markAllAsRead.mutate()} className="btn-secondary text-sm">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center text-sm text-slate-400 dark:text-slate-500">
          No notifications yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`card flex items-start justify-between gap-3 ${
                notification.isRead ? '' : 'border-brand-200 bg-brand-50/40 dark:border-brand-900 dark:bg-brand-950/20'
              }`}
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-50">{notification.title}</p>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{notification.message}</p>
                <p className="mt-1.5 text-xs text-slate-400">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {notification.link && (
                  <Link
                    to={notification.link}
                    className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                  >
                    View
                  </Link>
                )}
                {!notification.isRead && (
                  <button
                    type="button"
                    onClick={() => markAsRead.mutate(notification._id)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
