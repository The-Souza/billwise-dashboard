"use client";

import { Card } from "@/components/ui/card";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  BellIcon,
  CheckCheckIcon,
} from "lucide-react";
import Link from "next/link";
import { useNotifications } from "./NotificationsContext";

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; accentClass: string }
> = {
  overdue: {
    label: "Vencida",
    icon: (
      <div className="p-2 rounded-md bg-destructive/10 shrink-0">
        <AlertTriangleIcon className="size-4 text-destructive" />
      </div>
    ),
    accentClass: "border-l-destructive/60",
  },
  due_soon: {
    label: "Prestes a vencer",
    icon: (
      <div className="p-2 rounded-md bg-amber-600/10 shrink-0">
        <AlertCircleIcon className="size-4 text-amber-500" />
      </div>
    ),
    accentClass: "border-l-amber-500/60",
  },
};

export function NotificationsClient() {
  const { notifications, filter, handleMarkOne } = useNotifications();

  const filtered =
    filter === "all"
      ? notifications
      : notifications.filter((n) => n.type === filter);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="p-4 rounded-full bg-muted">
          <BellIcon className="h-6 w-6 text-muted-foreground opacity-50" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Nenhuma notificação</p>
          <p className="text-xs text-muted-foreground">
            Você está em dia com tudo por aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
      {filtered.map((n) => {
        const config = TYPE_CONFIG[n.type];
        const isUnread = !n.readAt;

        const CardWrapper = n.accountId
          ? ({ children }: { children: React.ReactNode }) => (
              <Link
                href={`/accounts/${n.accountId}`}
                onClick={() => isUnread && handleMarkOne(n.id)}
                className="block"
              >
                {children}
              </Link>
            )
          : ({ children }: { children: React.ReactNode }) => <>{children}</>;

        return (
          <CardWrapper key={n.id}>
            <Card
              className={`relative flex items-start gap-3 rounded-md border-l-2 px-4 py-3 text-sm transition-colors ${
                config?.accentClass ?? "border-l-border"
              } ${n.accountId ? "hover:bg-muted/50 cursor-pointer" : ""} ${
                isUnread ? "bg-muted/40" : ""
              }`}
            >
              {isUnread && (
                <span
                  aria-label="Não lida"
                  className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary"
                />
              )}

              {config?.icon ?? (
                <div className="p-2 rounded-md bg-muted shrink-0">
                  <BellIcon className="size-4 text-muted-foreground" />
                </div>
              )}

              <div className="flex flex-col gap-1 flex-1 min-w-0 pr-4">
                <span className="font-heading font-semibold text-sm">
                  {n.title}
                </span>

                {n.body && (
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    {n.body}
                  </span>
                )}

                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {new Date(n.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  {isUnread && !n.accountId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkOne(n.id);
                      }}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      <CheckCheckIcon className="h-3 w-3" />
                      Marcar como lida
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </CardWrapper>
        );
      })}
    </div>
  );
}
