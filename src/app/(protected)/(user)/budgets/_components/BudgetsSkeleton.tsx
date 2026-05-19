import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BudgetsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="flex gap-0.5 items-center">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-3 w-full rounded-full" />
            <div className="flex justify-between">
              <Skeleton className="h-5 w-34" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
        </Card>
      ))}
    </div>
  );
}
