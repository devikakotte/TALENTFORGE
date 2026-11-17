import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadNotificationCount,
} from '../../hooks/useNotifications';
import { useAuth } from '../../context/AuthContext';
import { getDashboardRouteForRole } from '../../constants';

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const { data: unreadCount } = useUnreadNotificationCount();
  const { data } = useNotifications({ limit: 8 });
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  const notifications = data?.notifications || [];
  const notificationsPath = `${getDashboardRouteForRole(user?.role)}/notifications`;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-default"
            aria-label="Close notifications"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Notifications</p>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead.mutate()}
                  className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() => {
                      if (!notification.isRead) markAsRead.mutate(notification._id);
                    }}
                    className={`block w-full border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                      notification.isRead ? '' : 'bg-brand-50/50 dark:bg-brand-950/30'
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                      {notification.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">{timeAgo(notification.createdAt)}</p>
                  </button>
                ))
              )}
            </div>
            <Link
              to={notificationsPath}
              onClick={() => setIsOpen(false)}
              className="block border-t border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-brand-600 hover:underline dark:border-slate-800 dark:text-brand-400"
            >
              View all
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;
