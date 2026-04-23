"use client";

import { ChartDataPoint } from "@/actions/(user)/dashboard/get-chart-data";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/format-currency";
import { TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface RevenueExpenseChartProps {
  data?: ChartDataPoint[];
  isLoading?: boolean;
}

const chartConfig = {
  income: { label: "Receita", color: "var(--chart-1)" },
  expense: { label: "Despesa", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function RevenueExpenseChart({
  data = [],
  isLoading,
}: RevenueExpenseChartProps) {
  const [chartPeriod, setChartPeriod] = useState("6");

  const chartData = useMemo(
    () => data.slice(-Number(chartPeriod)),
    [data, chartPeriod],
  );

  return (
    <Card className="lg:col-span-3">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="font-heading text-md">
            Receitas vs Despesas
          </CardTitle>
          <CardDescription>
            Histórico dos últimos {chartPeriod} meses
          </CardDescription>
        </div>
        <Select value={chartPeriod} onValueChange={setChartPeriod}>
          <SelectTrigger className="w-26 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 meses</SelectItem>
            <SelectItem value="6">6 meses</SelectItem>
            <SelectItem value="12">12 meses</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-80 md:h-136 w-full rounded-lg" />
        ) : chartData.length === 0 ? (
          <div className="h-136 w-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <TrendingUp className="h-8 w-8 opacity-30" />
            <p className="text-sm">Nenhuma movimentação neste período.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-80 md:h-136 w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-income)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-income)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-expense)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-expense)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
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
              <Area
                type="monotone"
                dataKey="income"
                stroke="var(--color-income)"
                strokeWidth={2}
                fill="url(#incomeGrad)"
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="var(--color-expense)"
                strokeWidth={2}
                fill="url(#expenseGrad)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
