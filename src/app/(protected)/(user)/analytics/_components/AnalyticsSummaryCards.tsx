import type { AnalyticsSummary } from "@/actions/(user)/analytics/get-analytics-summary";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/format-currency";
import { CalendarIcon, TrendingDown, TrendingUp, Wallet } from "lucide-react";

interface AnalyticsSummaryCardsProps {
  data?: AnalyticsSummary;
  isLoading?: boolean;
}

const CARDS = [
  {
    id: "income",
    title: "Total receitas",
    key: "totalIncome" as const,
    icon: TrendingUp,
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
  },
  {
    id: "expense",
    title: "Total despesas",
    key: "totalExpense" as const,
    icon: TrendingDown,
    colorClass: "text-destructive",
    bgClass: "bg-destructive/10",
  },
  {
    id: "balance",
    title: "Saldo do período",
    key: "balance" as const,
    icon: Wallet,
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
  },
  {
    id: "avg",
    title: "Média mensal de despesas",
    key: "avgMonthlyExpense" as const,
    icon: CalendarIcon,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
  },
];

export function AnalyticsSummaryCards({
  data,
  isLoading,
}: AnalyticsSummaryCardsProps) {
  return (
    <>
      {CARDS.map((item) => (
        <Card key={item.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-md font-heading text-muted-foreground">
              {item.title}
            </CardTitle>
            <div className={`p-2 rounded-md ${item.bgClass}`}>
              <item.icon className={`h-4 w-4 ${item.colorClass}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <Skeleton className="h-8 w-30" />
            ) : (
              <p className="text-2xl font-bold tracking-tight">
                {formatCurrency(data[item.key])}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
