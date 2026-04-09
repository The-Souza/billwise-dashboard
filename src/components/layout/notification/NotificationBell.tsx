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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowRight, BellIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NotificationsList } from "./NotificationsList";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

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

  const trigger = (
    <Button variant="ghost" size="icon-sm" className="relative">
      <BellIcon className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[0.625rem] text-primary-foreground font-medium">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Button>
  );

  const header = (
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <span className="text-sm font-medium">Notificações</span>
      {notifications.length > 0 && (
        <Link
          href="/notifications"
          onClick={() => setOpen(false)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 capitalize"
        >
          Ver todas
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          aria-describedby={undefined}
          showCloseButton={false}
          side="bottom"
          className="p-0 rounded-t-xl max-h-[70vh]"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Notificações</SheetTitle>
          </SheetHeader>
          {header}
          <div className="flex flex-col overflow-y-auto max-h-[calc(70vh-3.5rem)]">
            <NotificationsList
              notifications={notifications}
              loading={loading}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        {header}
        <div className="flex flex-col max-h-80 overflow-y-auto">
          <NotificationsList notifications={notifications} loading={loading} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
