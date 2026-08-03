"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCheckIcon } from "lucide-react";
import { useNotifications } from "./NotificationsContext";

type FilterType =
  | "all"
  | "overdue"
  | "due_soon"
  | "budget_exceeded"
  | "recurring_generated"
  | "workspace_invite";

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "overdue", label: "Vencidas" },
  { value: "due_soon", label: "Prestes a vencer" },
  { value: "budget_exceeded", label: "Orçamento" },
  { value: "recurring_generated", label: "Recorrentes" },
  { value: "workspace_invite", label: "Convites" },
];

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
    <div className="flex flex-col lg:flex-row items-center justify-between gap-2">
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as FilterType)}
        className="w-full lg:w-auto"
      >
        <TabsList className="w-full lg:w-auto overflow-x-auto justify-start">
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
  );
}
