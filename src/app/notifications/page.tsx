"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BellIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import MobileLayout from "@/components/layout/MobileLayout";
import {
  type AppNotification,
  clearNotifications,
  getNotificationsUpdateEventName,
  loadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../library/notifications";

export default function NotificationsPage() {
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

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

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

  const getIcon = (type: AppNotification["type"]) => {
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

  return (
    <MobileLayout>
      <div className="min-h-screen bg-[#eef3f6] px-3 py-4 sm:px-4 sm:py-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-primary-200 bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-semibold text-primary-900">
                  Notifications
                </h1>
                <p className="text-sm text-primary-600 mt-1">
                  {unreadCount} unread • {notifications.length} total
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    try {
                      await markAllNotificationsRead();
                      setNotifications(await loadNotifications());
                    } catch {
                      return;
                    }
                  }}
                  className="rounded-full border border-primary-200 px-3 py-1.5 text-xs text-primary-700"
                >
                  Mark all read
                </button>
                <button
                  onClick={async () => {
                    try {
                      await clearNotifications();
                      setNotifications([]);
                    } catch {
                      return;
                    }
                  }}
                  className="rounded-full border border-primary-200 px-3 py-1.5 text-xs text-primary-700"
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={async () => {
                      try {
                        await markNotificationRead(notification.id);
                        setNotifications(await loadNotifications());
                      } catch {
                        return;
                      }
                    }}
                    className={`w-full rounded-2xl border px-3 py-3 text-left transition-colors ${
                      notification.read
                        ? "border-primary-200 bg-white"
                        : "border-[#b8dfff] bg-[#e9f5ff]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getIcon(notification.type)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-primary-900 truncate">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-[#0a4abf]" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-primary-700">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-primary-500">
                          {formatTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-2xl border border-primary-200 bg-primary-50 p-8 text-center">
                  <BellIcon className="w-8 h-8 text-primary-400 mx-auto mb-2" />
                  <p className="text-sm text-primary-700">
                    No notifications yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
