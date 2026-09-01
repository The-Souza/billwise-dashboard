"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NOTIFICATION_FILTER_OPTIONS as FILTER_OPTIONS } from "@/config/notification-filters";
import type { NotificationFilterType as FilterType } from "@/config/notification-filters";
import { CheckCheckIcon } from "lucide-react";
import { useNotifications } from "./NotificationsContext";

export function NotificationsToolbar() {
  const {
    notifications,
    filter,
    setFilter,
    unreadCount,
    markingAll,
    handleMarkAll,
  } = useNotifications();

  function countFor(value: FilterType) {
    return value === "all"
      ? notifications.length
      : notifications.filter((n) => n.type === value).length;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-2">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as FilterType)}
          className="w-full xl:w-auto"
        >
          <TabsList className="w-full overflow-x-auto justify-start">
            {FILTER_OPTIONS.map((opt) => (
              <TabsTrigger
                key={opt.value}
                value={opt.value}
                className="shrink-0 flex-1 gap-1.5"
              >
                {opt.label}
                <span className="text-xs tabular-nums opacity-70">
                  ({countFor(opt.value)})
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            disabled={markingAll}
            onClick={handleMarkAll}
          >
            <CheckCheckIcon className="h-3.5 w-3.5" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {notifications.length >= 50 && (
        <p className="text-xs text-muted-foreground">
          Mostrando as 50 notificações mais recentes. Notificações mais antigas
          não aparecem aqui.
        </p>
      )}
    </div>
  );
}
