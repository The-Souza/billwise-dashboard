"use client";

import { NotificationItem } from "@/actions/notifications/get-notifications";
import { markNotificationsReadAction } from "@/actions/notifications/mark-notifications-read";
import { createContext, useContext, useState } from "react";

type FilterType = "all" | "overdue" | "due_soon";

type NotificationsContextValue = {
  notifications: NotificationItem[];
  filter: FilterType;
  unreadCount: number;
  markingAll: boolean;
  setFilter: (f: FilterType) => void;
  handleMarkOne: (id: string) => Promise<void>;
  handleMarkAll: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({
  children,
  initialNotifications,
}: {
  children: React.ReactNode;
  initialNotifications: NotificationItem[];
}) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<FilterType>("all");
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  async function handleMarkOne(id: string) {
    await markNotificationsReadAction([id]);
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    );
  }

  async function handleMarkAll() {
    setMarkingAll(true);
    await markNotificationsReadAction();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
    );
    setMarkingAll(false);
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
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      "useNotifications deve ser usado dentro de NotificationsProvider",
    );
  return ctx;
}
