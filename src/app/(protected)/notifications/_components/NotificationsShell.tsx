"use client";

import { NotificationItem } from "@/actions/notifications/get-notifications";
import { NotificationsClient } from "./NotificationsClient";
import { NotificationsProvider } from "./NotificationsContext";
import { NotificationsToolbar } from "./NotificationsToolbar";

export function NotificationsShell({
  notifications,
}: {
  notifications: NotificationItem[];
}) {
  return (
    <NotificationsProvider initialNotifications={notifications}>
      <NotificationsToolbar />
      <NotificationsClient />
    </NotificationsProvider>
  );
}
