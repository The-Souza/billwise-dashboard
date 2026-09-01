import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NOTIFICATION_FILTER_OPTIONS as FILTER_OPTIONS } from "@/config/notification-filters";

export function NotificationsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-2">
        <Tabs
          defaultValue={FILTER_OPTIONS[0].value}
          className="w-full xl:w-auto"
        >
          <TabsList className="w-full overflow-x-auto justify-start">
            {FILTER_OPTIONS.map((opt) => (
              <TabsTrigger
                key={opt.value}
                value={opt.value}
                disabled
                className="shrink-0 flex-1 gap-1.5"
              >
                {opt.label}
                <span className="text-xs tabular-nums opacity-70">(0)</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="flex min-h-32.5 h-full items-start gap-3 rounded-md border border-border px-4 py-3"
          >
            <Skeleton className="h-8 w-8 rounded-md shrink-0" />
            <div className="flex flex-col gap-1 flex-1 h-full min-w-0 pr-4">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-2/3 md:w-1/2 xl:w-1/3" />
              <div className="flex-1 flex flex-col gap-1.5 py-0.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <div className="flex min-h-7 items-center justify-between gap-2 mt-1">
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
