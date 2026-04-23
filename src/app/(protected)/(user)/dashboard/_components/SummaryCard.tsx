import { MonthlySummary } from "@/actions/(user)/dashboard/get-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendIndicator } from "@/components/ui/trend-indicator";
import { formatCurrency } from "@/utils/format-currency";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";

interface SummaryCardProps {
  data?: MonthlySummary;
  isLoading?: boolean;
}

const CARD_CONFIG = [
  {
    id: "saldo",
    title: "Saldo do mês",
    valueKey: "balance" as const,
    trendKey: "balanceTrend" as const,
    isGood: true,
    icon: Wallet,
  },
  {
    id: "receita",
    title: "Receitas",
    valueKey: "totalIncome" as const,
    trendKey: "incomeTrend" as const,
    isGood: true,
    icon: TrendingUp,
  },
  {
    id: "despesas",
    title: "Despesas",
    valueKey: "totalExpense" as const,
    trendKey: "expenseTrend" as const,
    isGood: false,
    icon: TrendingDown,
  },
];

export function SummaryCard({ data, isLoading }: SummaryCardProps) {
  return (
    <>
      {CARD_CONFIG.map((item) => (
        <Card key={item.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-md font-heading text-muted-foreground">
              {item.title}
            </CardTitle>
            <div className="p-2 rounded-md bg-primary/10">
              <item.icon className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {isLoading || !data ? (
              <>
                <Skeleton className="h-8 w-30" />
                <Skeleton className="h-5 w-40" />
              </>
            ) : (
              <>
                <p className="text-2xl font-bold tracking-tight">
                  {formatCurrency(data[item.valueKey])}
                </p>
                <TrendIndicator
                  trend={data[item.trendKey]}
                  isGood={item.isGood}
                  label="mês anterior"
                />
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}
