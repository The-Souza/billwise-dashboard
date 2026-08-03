import { BudgetProgressItem } from "@/actions/(user)/dashboard/get-budget-progress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { QueryErrorState } from "@/components/ui/query-error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format-currency";
import {
  formatPercentage,
  formatPercentageOverflow,
} from "@/utils/format-text";
import { getStatusClasses } from "@/utils/get-status-classes";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface BudgetProgressProps {
  data?: BudgetProgressItem[];
  label: string;
  isLoading?: boolean;
  isError?: boolean;
  isRetrying?: boolean;
  onRetry?: () => void;
}

function BudgetItem({ budget }: { budget: BudgetProgressItem }) {
  const isIncome = budget.type === "income";
  const isOver = budget.usedPercentage > 100;
  const percentage = Math.min(budget.usedPercentage, 100);
  const classes = getStatusClasses(budget.usedPercentage, isIncome);

  function statusText() {
    if (isIncome) {
      return budget.usedPercentage >= 100
        ? "Meta atingida!"
        : `${formatPercentage(budget.usedPercentage)} alcançado`;
    }
    return isOver
      ? `${formatPercentageOverflow(budget.usedPercentage)} acima`
      : `${formatPercentage(budget.usedPercentage)} utilizado`;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium min-w-0">
          {budget.icon && (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
              <CategoryIcon
                name={budget.icon}
                className="h-3.5 w-3.5 text-muted-foreground"
              />
            </span>
          )}
          <span className="truncate">{budget.category}</span>
        </span>
        <span className="text-xs font-medium tabular-nums shrink-0">
          {formatCurrency(budget.spent)}{" "}
          <span className="text-muted-foreground/60 font-normal">de</span>{" "}
          {formatCurrency(budget.limit)}
        </span>
      </div>

      <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            classes.bar,
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-end">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
            classes.badge,
          )}
        >
          {statusText()}
        </span>
      </div>
    </div>
  );
}

function BudgetSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 h-17">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
            <div className="flex justify-end">
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        ))}
        <Skeleton className="h-4 w-22" />
      </div>
    </>
  );
}

function MoreLink({ count }: { count: number }) {
  return (
    <Button
      variant="link"
      size="sm"
      className="text-xs h-auto p-0 self-start"
      asChild
    >
      <Link href="/budgets">
        +{count} {count === 1 ? "orçamento" : "orçamentos"}
      </Link>
    </Button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-1 py-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="link" size="sm" className="text-xs h-auto p-0" asChild>
        <Link href="/budgets">Criar orçamento</Link>
      </Button>
    </div>
  );
}

export function BudgetProgress({
  data,
  label,
  isLoading,
  isError,
  isRetrying,
  onRetry,
}: BudgetProgressProps) {
  const allExpense = (data ?? []).filter((b) => b.type === "expense");
  const allIncome = (data ?? []).filter((b) => b.type === "income");
  const expense = allExpense.slice(0, 4);
  const income = allIncome.slice(0, 4);
  const totalExpense = allExpense[0]?.totalCount ?? allExpense.length;
  const totalIncome = allIncome[0]?.totalCount ?? allIncome.length;

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="font-heading text-base">Orçamentos</CardTitle>
          <CardDescription>Uso em {label}</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-xs" asChild>
          <Link href="/budgets">
            Ver todos
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {isError ? (
          <QueryErrorState
            message="Não foi possível carregar os orçamentos."
            onRetry={() => onRetry?.()}
            isRetrying={isRetrying}
          />
        ) : (
          <Tabs defaultValue="expense" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="expense" className="flex-1">
                Despesas
              </TabsTrigger>
              <TabsTrigger value="income" className="flex-1">
                Metas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="expense" className="flex flex-col gap-4 mt-4">
              {isLoading ? (
                <BudgetSkeleton />
              ) : expense.length === 0 ? (
                <EmptyState message="Nenhum orçamento de despesa definido." />
              ) : (
                <>
                  {expense.map((b) => (
                    <BudgetItem key={b.id} budget={b} />
                  ))}
                  {totalExpense > expense.length && (
                    <MoreLink count={totalExpense - expense.length} />
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="income" className="flex flex-col gap-4 mt-4">
              {isLoading ? (
                <BudgetSkeleton />
              ) : income.length === 0 ? (
                <EmptyState message="Nenhuma meta de receita definida." />
              ) : (
                <>
                  {income.map((b) => (
                    <BudgetItem key={b.id} budget={b} />
                  ))}
                  {totalIncome > income.length && (
                    <MoreLink count={totalIncome - income.length} />
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
