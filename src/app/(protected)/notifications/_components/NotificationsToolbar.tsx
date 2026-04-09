"use client";

import { Button } from "@/components/ui/button";
import { CheckCheckIcon } from "lucide-react";
import { useNotifications } from "./NotificationsContext";

type FilterType = "all" | "overdue" | "due_soon";

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "overdue", label: "Vencidas" },
  { value: "due_soon", label: "Prestes a vencer" },
];

export function NotificationsToolbar() {
  const { filter, setFilter, unreadCount, markingAll, handleMarkAll } =
    useNotifications();

  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      <div className="flex items-center gap-1">
        {FILTER_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={filter === opt.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>

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
