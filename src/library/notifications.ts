export type NotificationType = "info" | "success" | "warning" | "error";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
}

const UPDATE_EVENT = "lenno-notifications-updated";

function emitUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function getNotificationsUpdateEventName() {
  return UPDATE_EVENT;
}

export async function loadNotifications(): Promise<AppNotification[]> {
  const response = await fetch("/api/notifications", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401) return [];
    throw new Error("Failed to load notifications");
  }

  return (await response.json()) as AppNotification[];
}

export async function addNotification(input: CreateNotificationInput) {
  const response = await fetch("/api/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error("Failed to create notification");
  const created = (await response.json()) as AppNotification;
  emitUpdate();
  return created;
}

export async function markNotificationRead(id: string) {
  const response = await fetch(`/api/notifications/${id}/read`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) throw new Error("Failed to mark notification as read");
  emitUpdate();
}

export async function markAllNotificationsRead() {
  const response = await fetch("/api/notifications/read-all", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) throw new Error("Failed to mark all notifications as read");
  emitUpdate();
}

export async function clearNotifications() {
  const response = await fetch("/api/notifications", {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) throw new Error("Failed to clear notifications");
  emitUpdate();
}
