"use client";

import type { CategoryBreakdownItem } from "@/actions/(user)/analytics/get-category-breakdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/utils/format-currency";
import { capitalizeFirst } from "@/utils/format-text";
import { PieChart as PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryBreakdownChartProps {
  data?: CategoryBreakdownItem[];
  isLoading?: boolean;
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: CategoryBreakdownItem;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md text-xs">
      <p className="font-medium mb-1">{capitalizeFirst(item.categoryName)}</p>
      <p className="text-muted-foreground">
        Total:{" "}
        <span className="text-foreground font-medium">
          {formatCurrency(item.total)}
        </span>
      </p>
      <p className="text-muted-foreground">
        Participação:{" "}
        <span className="text-foreground font-medium">
          {item.percentage.toFixed(1)}%
        </span>
      </p>
      <p className="text-muted-foreground">
        Transações:{" "}
        <span className="text-foreground font-medium">{item.count}</span>
      </p>
    </div>
  );
}

export function CategoryBreakdownChart({
  data = [],
  isLoading,
}: CategoryBreakdownChartProps) {
  const hasData = data.length > 0;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="font-heading text-md">
          Distribuição por categoria
        </CardTitle>
        <CardDescription>
          Participação de cada categoria no total
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center h-45 w-full">
              <Skeleton className="h-40 w-40 rounded-full" />
            </div>
            <div className="w-full flex flex-col gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 h-4">
                  <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0" />
                  <div className="flex w-full justify-between items-center">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !hasData ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <PieChartIcon className="h-8 w-8 opacity-30" />
            <p className="text-sm">Nenhum dado neste período.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {data.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-col gap-1.5">
              {data.slice(0, 5).map((item, index) => (
                <div
                  key={item.categoryId}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate text-muted-foreground">
                      {capitalizeFirst(item.categoryName)}
                    </span>
                  </div>
                  <span className="font-medium tabular-nums shrink-0">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
