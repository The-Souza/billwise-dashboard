"use client";

import {
  getNotificationsAction,
  NotificationItem,
} from "@/actions/notifications/get-notifications";
import { markNotificationsReadAction } from "@/actions/notifications/mark-notifications-read";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  ArrowRight,
  BellIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const TYPE_ICON: Record<string, React.ReactNode> = {
  overdue: (
    <div className="p-1.5 rounded-md bg-destructive/10 shrink-0">
      <AlertTriangleIcon className="size-3.5 text-destructive" />
    </div>
  ),
  due_soon: (
    <div className="p-1.5 rounded-md bg-amber-600/10 shrink-0">
      <AlertCircleIcon className="size-3.5 text-amber-500" />
    </div>
  ),
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function load() {
    const result = await getNotificationsAction();
    if (result.success) {
      setNotifications(result.data);
      setUnreadCount(result.unreadCount);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleOpen(isOpen: boolean) {
    setOpen(isOpen);

    if (isOpen) {
      setLoading(true);
      const result = await getNotificationsAction();
      setLoading(false);

      if (result.success) {
        setNotifications(result.data);
        setUnreadCount(result.unreadCount);

        if (result.unreadCount > 0) {
          await markNotificationsReadAction();
          setUnreadCount(0);
          setNotifications(
            result.data.map((n) => ({
              ...n,
              readAt: n.readAt ?? new Date().toISOString(),
            })),
          );
        }
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative">
          <BellIcon className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.625rem] text-primary-foreground font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-medium">Notificações</span>
          {notifications.length > 0 && (
            <Link
              href="/notifications"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Ver todas
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <div className="flex flex-col max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-3 px-4 py-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <BellIcon className="h-6 w-6 opacity-40" />
              <p className="text-xs">Nenhuma notificação</p>
            </div>
          ) : (
            notifications.slice(0, 5).map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 text-sm ${
                  !n.readAt ? "bg-muted/50" : ""
                }`}
              >
                {TYPE_ICON[n.type] ?? (
                  <div className="p-1.5 rounded-md bg-muted shrink-0">
                    <BellIcon className="size-3.5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="font-medium capitalize leading-tight">
                    {n.title}
                  </span>
                  {n.body && (
                    <span className="text-muted-foreground text-xs line-clamp-2">
                      {n.body}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground mt-0.5 capitalize">
                    {new Date(n.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
