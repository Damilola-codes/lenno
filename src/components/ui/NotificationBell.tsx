"use client";
import { useEffect, useState } from "react";
import {
  BellIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import {
  getNotificationsUpdateEventName,
  loadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "../../library/notifications";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const sync = async () => {
      try {
        const next = await loadNotifications();
        setNotifications(next);
      } catch {
        setNotifications([]);
      }
    };
    void sync();

    const eventName = getNotificationsUpdateEventName();
    const handleStorage = () => sync();
    window.addEventListener("storage", handleStorage);
    window.addEventListener(eventName, handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(eventName, handleStorage);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      const next = await loadNotifications();
      setNotifications(next);
    } catch {
      return;
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      const next = await loadNotifications();
      setNotifications(next);
    } catch {
      return;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckIcon className="w-4 h-4 text-green-600" />;
      case "warning":
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />;
      case "error":
        return <XMarkIcon className="w-4 h-4 text-red-600" />;
      default:
        return <InformationCircleIcon className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-primary-600 hover:text-primary-900 transition-colors"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-primary-200 z-50 max-h-96 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-primary-200">
                <h3 className="font-semibold text-primary-900">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => void markAllAsRead()}
                    className="text-sm text-secondary-600 hover:text-secondary-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-primary-100 last:border-b-0 hover:bg-primary-50 cursor-pointer transition-colors ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                      onClick={() => void markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium text-primary-900">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-primary-600 mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-primary-400">
                            {formatTimeAgo(notification.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <BellIcon className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                    <p className="text-sm text-primary-600">
                      No notifications yet
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-primary-200">
                  <button
                    className="w-full text-sm text-secondary-600 hover:text-secondary-700 text-center"
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = "/notifications";
                    }}
                  >
                    View all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
