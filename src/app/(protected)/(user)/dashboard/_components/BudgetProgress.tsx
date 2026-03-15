import { BudgetProgressItem } from "@/actions/(user)/get-budget-progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/format-currency";

interface BudgetProgressProps {
  data?: BudgetProgressItem[];
  label: string;
  isLoading?: boolean;
}

export function BudgetProgress({
  data,
  label,
  isLoading,
}: BudgetProgressProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-heading text-md">Orçamentos</CardTitle>
        <CardDescription className="capitalize">Uso em {label}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
          ))
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum orçamento definido.
          </p>
        ) : (
          data.map((budget) => (
            <div key={budget.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{budget.category}</span>
                <span className="text-muted-foreground text-xs">
                  {formatCurrency(budget.spent)} /{" "}
                  {formatCurrency(budget.limit)}
                </span>
              </div>
              <Progress value={budget.usedPercentage} />
              <p className="text-xs text-right">
                {budget.usedPercentage > 100 ? (
                  <span className="text-destructive font-medium">
                    {(budget.usedPercentage - 100).toFixed(0)}% acima do limite
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {budget.usedPercentage.toFixed(0)}% utilizado
                  </span>
                )}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
