import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <Skeleton className="h-8 w-full xl:w-231.25 rounded-md" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card
            key={i}
            className="flex h-32.5 items-start gap-3 rounded-md border border-border px-4 py-3"
          >
            <Skeleton className="h-8 w-8 rounded-md shrink-0" />
            <div className="flex flex-col gap-3 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
