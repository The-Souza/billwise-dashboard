import { Suspense } from "react";
import { NotificationsContent } from "./_components/NotificationsContent";
import { NotificationsSkeleton } from "./_components/NotificationsSkeleton";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-bold font-heading tracking-tight">
          Notificações
        </h1>
        <p className="text-sm text-muted-foreground">
          Suas últimas notificações dos últimos 30 dias.
        </p>
      </div>

      <Suspense fallback={<NotificationsSkeleton />}>
        <NotificationsContent />
      </Suspense>
    </div>
  );
}
