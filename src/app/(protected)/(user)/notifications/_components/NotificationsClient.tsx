"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode }> =
  {
    overdue: {
      label: "Vencida",
      icon: (
        <div className="p-2 rounded-md bg-destructive/10 shrink-0">
          <AlertTriangleIcon className="size-4 text-destructive" />
        </div>
      ),
    },
    due_soon: {
      label: "Prestes a vencer",
      icon: (
        <div className="p-2 rounded-md bg-primary/10 shrink-0">
          <AlertCircleIcon className="size-4 text-primary" />
        </div>
      ),
    },
    budget_exceeded: {
      label: "Orçamento",
      icon: (
        <div className="p-2 rounded-md bg-destructive/10 shrink-0">
          <TrendingUpIcon className="size-4 text-destructive" />
        </div>
      ),
    },
    recurring_generated: {
      label: "Recorrente",
      icon: (
        <div className="p-2 rounded-md bg-primary/10 shrink-0">
          <RefreshCwIcon className="size-4 text-primary" />
        </div>
      ),
    },
    workspace_invite: {
      label: "Convite",
      icon: (
        <div className="p-2 rounded-md bg-secondary shrink-0">
          <UsersIcon className="size-4 text-foreground" />
        </div>
      ),
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
  const [confirmingDecline, setConfirmingDecline] = useState(false);

  if (inviteStatus === "accepted" || inviteStatus === "declined") {
    return (
      <span
        className={cn(
          "text-xs font-medium shrink-0",
          inviteStatus === "accepted"
            ? "text-foreground"
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
        size="icon-sm"
        variant="ghost"
        className="text-foreground hover:text-foreground hover:bg-secondary"
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
        size="icon-sm"
        variant="ghost"
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        disabled={loading !== null}
        aria-label="Recusar convite"
        onClick={(e) => {
          e.stopPropagation();
          setConfirmingDecline(true);
        }}
      >
        {loading === "declined" ? <Spinner /> : <XIcon />}
      </Button>

      <AlertDialog
        open={confirmingDecline}
        onOpenChange={setConfirmingDecline}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Recusar convite?</AlertDialogTitle>
            <AlertDialogDescription>
              Você não poderá desfazer essa ação. Para participar do workspace
              depois, será preciso um novo convite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading !== null}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={loading !== null}
              onClick={(e) => {
                e.preventDefault();
                respond("declined");
              }}
            >
              {loading === "declined" ? <Spinner /> : "Recusar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
    const hasOtherNotifications = notifications.length > 0;
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="p-4 rounded-full bg-muted">
          <BellIcon className="h-6 w-6 text-muted-foreground opacity-50" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">
            {hasOtherNotifications
              ? "Nenhuma notificação neste filtro"
              : "Nenhuma notificação"}
          </p>
          <p className="text-xs text-muted-foreground">
            {hasOtherNotifications
              ? "Experimente outro filtro para ver suas notificações."
              : "Você está em dia com tudo por aqui."}
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

        const card = (
          <Card
            className={`relative flex min-h-32.5 items-start gap-3 rounded-md px-4 py-3 text-sm transition-colors ${
              n.accountId ? "hover:bg-muted/50 cursor-pointer" : ""
            } ${isUnread ? "bg-muted/40" : ""}`}
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
              {config?.label && (
                <span className="text-xs font-medium text-muted-foreground">
                  {config.label}
                </span>
              )}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto gap-1 px-1.5 py-0.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkOne(n.id);
                      }}
                    >
                      <CheckCheckIcon className="h-3 w-3" />
                      Marcar como lida
                    </Button>
                  )
                )}
              </div>
            </div>
          </Card>
        );

        return n.accountId ? (
          <Link
            key={n.id}
            href={`/accounts/${n.accountId}`}
            onClick={() => isUnread && handleMarkOne(n.id)}
            className="block"
          >
            {card}
          </Link>
        ) : (
          <div key={n.id}>{card}</div>
        );
      })}
    </div>
  );
}
