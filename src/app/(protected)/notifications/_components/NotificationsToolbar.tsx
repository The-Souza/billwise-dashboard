"use client";

import { Button } from "@/components/ui/button";
import { CheckCheckIcon } from "lucide-react";
import { useNotifications } from "./NotificationsContext";

type FilterType =
  | "all"
  | "overdue"
  | "due_soon"
  | "budget_exceeded"
  | "recurring_generated";

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "overdue", label: "Vencidas" },
  { value: "due_soon", label: "Prestes a vencer" },
  { value: "budget_exceeded", label: "Orçamento" },
  { value: "recurring_generated", label: "Recorrentes" },
];

export function NotificationsToolbar() {
  const { filter, setFilter, unreadCount, markingAll, handleMarkAll } =
    useNotifications();

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-2">
      <div className="grid grid-cols-3 sm:grid-cols-5 items-center gap-1 w-full lg:w-auto">
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
