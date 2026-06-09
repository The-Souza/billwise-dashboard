"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { formatNotificationDateTime } from "@/utils/format-date";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  BellIcon,
  CheckCheckIcon,
  CheckIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
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
  budget_exceeded: {
    label: "Orçamento",
    icon: (
      <div className="p-2 rounded-md bg-orange-500/10 shrink-0">
        <TrendingUpIcon className="size-4 text-orange-500" />
      </div>
    ),
    accentClass: "border-l-orange-500/60",
  },
  recurring_generated: {
    label: "Recorrente",
    icon: (
      <div className="p-2 rounded-md bg-primary/10 shrink-0">
        <RefreshCwIcon className="size-4 text-primary" />
      </div>
    ),
    accentClass: "border-l-primary/60",
  },
  workspace_invite: {
    label: "Convite",
    icon: (
      <div className="p-2 rounded-md bg-violet-500/10 shrink-0">
        <UsersIcon className="size-4 text-violet-500" />
      </div>
    ),
    accentClass: "border-l-violet-500/60",
  },
};

function WorkspaceInviteActions({
  inviteId,
  notificationId,
  inviteStatus,
}: {
  inviteId: string;
  notificationId: string;
  inviteStatus: "pending" | "accepted" | "declined" | null;
}) {
  const { handleRespondToInvite } = useNotifications();
  const [loading, setLoading] = useState<"accepted" | "declined" | null>(null);

  if (inviteStatus === "accepted" || inviteStatus === "declined") {
    return (
      <span
        className={cn(
          "text-xs font-medium shrink-0",
          inviteStatus === "accepted"
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-muted-foreground",
        )}
      >
        {inviteStatus === "accepted" ? "Convite aceito" : "Convite recusado"}
      </span>
    );
  }

  async function respond(response: "accepted" | "declined") {
    setLoading(response);
    await handleRespondToInvite(inviteId, notificationId, response);
    setLoading(null);
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <Button
        size="icon"
        variant="ghost"
        className="size-7 text-emerald-600 hover:text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
        disabled={loading !== null}
        aria-label="Aceitar convite"
        onClick={(e) => {
          e.stopPropagation();
          respond("accepted");
        }}
      >
        {loading === "accepted" ? <Spinner /> : <CheckIcon />}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        disabled={loading !== null}
        aria-label="Recusar convite"
        onClick={(e) => {
          e.stopPropagation();
          respond("declined");
        }}
      >
        {loading === "declined" ? <Spinner /> : <XIcon />}
      </Button>
    </div>
  );
}

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
        const isInvite = n.type === "workspace_invite";

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

                <div className="flex min-h-7 items-center justify-between gap-2 mt-1">
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {formatNotificationDateTime(n.createdAt)}
                  </span>

                  {isInvite && n.workspaceInviteId ? (
                    <WorkspaceInviteActions
                      inviteId={n.workspaceInviteId}
                      notificationId={n.id}
                      inviteStatus={n.inviteStatus}
                    />
                  ) : (
                    isUnread &&
                    !n.accountId && (
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
                    )
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
