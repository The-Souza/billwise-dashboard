"use client";

import type { EvolutionDataPoint } from "@/actions/(user)/analytics/get-analytics-evolution";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/format-currency";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface EvolutionChartProps {
  data?: EvolutionDataPoint[];
  isLoading?: boolean;
}

const chartConfig = {
  income: { label: "Receita", color: "var(--chart-1)" },
  expense: { label: "Despesa", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function EvolutionChart({ data = [], isLoading }: EvolutionChartProps) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="font-heading text-md">Evolução mensal</CardTitle>
        <CardDescription>
          Receitas e despesas mês a mês no período
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-75 w-full rounded-lg" />
        ) : data.length === 0 ? (
          <div className="h-75 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <TrendingUp className="h-8 w-8 opacity-30" />
            <p className="text-sm">Nenhuma movimentação neste período.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-75 w-full">
            <BarChart data={data} barGap={2}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                width={48}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded shrink-0"
                          style={{
                            backgroundColor:
                              name === "income"
                                ? "var(--color-income)"
                                : "var(--color-expense)",
                          }}
                        />
                        <span className="text-muted-foreground">
                          {chartConfig[name as keyof typeof chartConfig]?.label}
                        </span>
                        <span className="font-medium tabular-nums text-foreground ml-auto">
                          {formatCurrency(Number(value))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar
                dataKey="income"
                fill="var(--color-income)"
                radius={[3, 3, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="expense"
                fill="var(--color-expense)"
                radius={[3, 3, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
