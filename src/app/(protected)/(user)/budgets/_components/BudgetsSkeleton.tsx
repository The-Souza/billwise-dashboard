import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BudgetsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {["Despesas", "Receitas"].map((label) => (
        <section key={label} className="flex flex-col gap-3">
          <Skeleton className="h-5 w-20" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="flex flex-col gap-3 p-4 h-35.5">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 items-center">
                    <Skeleton className="h-6 w-6 rounded-md" />
                    <Skeleton className="h-5 w-28" />
                  </div>
                  <div className="flex gap-1">
                    <Skeleton className="h-6 w-6 rounded-md" />
                    <Skeleton className="h-6 w-6 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-2.5 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-34" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-4 w-32" />
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
