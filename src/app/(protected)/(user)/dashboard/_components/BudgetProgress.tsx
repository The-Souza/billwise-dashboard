import { BudgetProgressItem } from "@/actions/(user)/dashboard/get-budget-progress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format-currency";
import { getStatusClasses } from "@/utils/get-status-classes";
import { ArrowRight, icons } from "lucide-react";
import Link from "next/link";

interface BudgetProgressProps {
  data?: BudgetProgressItem[];
  label: string;
  isLoading?: boolean;
}

function BudgetItem({ budget }: { budget: BudgetProgressItem }) {
  const IconComponent = budget.icon
    ? (icons[budget.icon as keyof typeof icons] as React.ElementType)
    : null;

  const isIncome = budget.type === "income";
  const isOver = budget.usedPercentage > 100;
  const percentage = Math.min(budget.usedPercentage, 100);
  const classes = getStatusClasses(budget.usedPercentage, isIncome);

  function statusText() {
    if (isIncome) {
      return budget.usedPercentage >= 100
        ? "Meta atingida!"
        : `${budget.usedPercentage.toFixed(0)}% alcançado`;
    }
    return isOver
      ? `+${(budget.usedPercentage - 100).toFixed(0)}% acima`
      : `${budget.usedPercentage.toFixed(0)}% utilizado`;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium min-w-0">
          {IconComponent && (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <IconComponent className="h-3.5 w-3.5 text-primary" />
            </span>
          )}
          <span className="truncate">{budget.category}</span>
        </span>
        <span className="text-xs text-muted-foreground tabular-nums shrink-0">
          {formatCurrency(budget.spent)}{" "}
          <span className="text-muted-foreground/60">de</span>{" "}
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
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex justify-end">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </>
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
}: BudgetProgressProps) {
  const expense = (data ?? []).filter((b) => b.type === "expense").slice(0, 6);
  const income = (data ?? []).filter((b) => b.type === "income").slice(0, 6);

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="flex flex-col gap-1">
          <CardTitle className="font-heading text-base">Orçamentos</CardTitle>
          <CardDescription className="capitalize">
            Uso em {label}
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-xs" asChild>
          <Link href="/budgets">
            Ver todos
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="expense">
          <TabsList className="w-auto">
            <TabsTrigger value="expense">Despesas</TabsTrigger>
            <TabsTrigger value="income">Metas</TabsTrigger>
          </TabsList>

          <TabsContent value="expense" className="flex flex-col gap-4 mt-4">
            {isLoading ? (
              <BudgetSkeleton />
            ) : expense.length === 0 ? (
              <EmptyState message="Nenhum orçamento de despesa definido." />
            ) : (
              expense.map((b) => <BudgetItem key={b.id} budget={b} />)
            )}
          </TabsContent>

          <TabsContent value="income" className="flex flex-col gap-4 mt-4">
            {isLoading ? (
              <BudgetSkeleton />
            ) : income.length === 0 ? (
              <EmptyState message="Nenhuma meta de receita definida." />
            ) : (
              income.map((b) => <BudgetItem key={b.id} budget={b} />)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
