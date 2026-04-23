import { NotificationItem } from "@/actions/notifications/get-notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircleIcon, AlertTriangleIcon, BellIcon } from "lucide-react";

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

export function NotificationsList({
  notifications,
  loading,
}: {
  notifications: NotificationItem[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-8 px-4 py-3">
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
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center px-4">
        <div className="p-3 rounded-full bg-muted">
          <BellIcon className="h-4 w-4 text-muted-foreground opacity-50" />
        </div>
        <p className="text-xs font-medium text-foreground">Sem notificações</p>
        <p className="text-xs text-muted-foreground">
          Você está em dia com tudo.
        </p>
      </div>
    );
  }

  return (
    <>
      {notifications.slice(0, 5).map((n) => (
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
            <span className="font-medium leading-tight">{n.title}</span>
            {n.body && (
              <span className="text-muted-foreground text-xs line-clamp-2">
                {n.body}
              </span>
            )}
            <span className="text-xs text-muted-foreground mt-0.5">
              {new Date(n.createdAt).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}
