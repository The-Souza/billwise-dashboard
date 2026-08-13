"use client";

import { NotificationItem } from "@/actions/(user)/notifications/get-notifications";
import { respondToInviteAction } from "@/actions/(user)/workspaces/respond-to-invite";
import { markNotificationsReadAction } from "@/actions/(user)/notifications/mark-notifications-read";
import { appToast } from "@/utils/app-toast";
import { createContext, useContext, useState } from "react";

type FilterType =
  | "all"
  | "overdue"
  | "due_soon"
  | "budget_exceeded"
  | "recurring_generated"
  | "workspace_invite"
  | "workspace_deleted";

type NotificationsContextValue = {
  notifications: NotificationItem[];
  filter: FilterType;
  unreadCount: number;
  markingAll: boolean;
  setFilter: (f: FilterType) => void;
  handleMarkOne: (id: string) => Promise<void>;
  handleMarkAll: () => Promise<void>;
  handleRespondToInvite: (inviteId: string, notificationId: string, response: "accepted" | "declined") => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({
  children,
  initialNotifications,
}: {
  children: React.ReactNode;
  initialNotifications: NotificationItem[];
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<FilterType>("all");
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  async function handleMarkOne(id: string) {
    const result = await markNotificationsReadAction([id]);
    if (!result.success) {
      appToast.error(result.error);
      return;
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
  }

  async function handleMarkAll() {
    setMarkingAll(true);
    const result = await markNotificationsReadAction();
    if (!result.success) {
      appToast.error(result.error);
      setMarkingAll(false);
      return;
    }
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
    );
    setMarkingAll(false);
  }

  async function handleRespondToInvite(
    inviteId: string,
    notificationId: string,
    response: "accepted" | "declined",
  ) {
    const result = await respondToInviteAction({ inviteId, response });
    if (!result.success) {
      appToast.error(result.error);
      return;
    }
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, inviteStatus: response, readAt: n.readAt ?? new Date().toISOString() }
          : n,
      ),
    );
  }

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        filter,
        unreadCount,
        markingAll,
        setFilter,
        handleMarkOne,
        handleMarkAll,
        handleRespondToInvite,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error("useNotifications deve ser usado dentro de NotificationsProvider");
  return ctx;
}
