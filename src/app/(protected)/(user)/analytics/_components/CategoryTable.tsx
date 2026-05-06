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
import { icons, RefreshCw } from "lucide-react";
import { useState } from "react";

type SortKey = "categoryName" | "total" | "count" | "average" | "percentage";
type SortDir = "asc" | "desc";

interface CategoryTableProps {
  data?: CategoryBreakdownItem[];
  isLoading?: boolean;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-muted-foreground/40">↕</span>;
  return <span className="text-foreground">{dir === "asc" ? "↑" : "↓"}</span>;
}

export function CategoryTable({ data = [], isLoading }: CategoryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp =
      typeof av === "string"
        ? av.localeCompare(bv as string)
        : (av as number) - (bv as number);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const headers: { key: SortKey; label: string; align?: "right" }[] = [
    { key: "categoryName", label: "Categoria" },
    { key: "total", label: "Total", align: "right" },
    { key: "count", label: "Transações", align: "right" },
    { key: "average", label: "Média", align: "right" },
    { key: "percentage", label: "% do total", align: "right" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-md">
          Detalhamento por categoria
        </CardTitle>
        <CardDescription>Clique nos cabeçalhos para ordenar</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {headers.map((h) => (
                  <th
                    key={h.key}
                    onClick={() => handleSort(h.key)}
                    className={`px-6 py-3 text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors ${
                      h.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {h.label}{" "}
                    <SortIcon active={sortKey === h.key} dir={sortDir} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-6 rounded-md shrink-0" />
                        <Skeleton className="h-3.5 w-28" />
                      </div>
                    </td>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-6 py-3 text-right">
                        <Skeleton className="h-3.5 w-16 ml-auto" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    Nenhuma categoria no período selecionado.
                  </td>
                </tr>
              ) : (
                sorted.map((item) => {
                  const IconComponent = item.categoryIcon
                    ? (icons[
                        item.categoryIcon as keyof typeof icons
                      ] as React.ElementType)
                    : null;

                  return (
                    <tr
                      key={item.categoryId}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                            {IconComponent ? (
                              <IconComponent className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5 text-primary" />
                            )}
                          </div>
                          <span className="font-medium">
                            {capitalizeFirst(item.categoryName)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums font-medium">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                        {item.count}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                        {formatCurrency(item.average)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums">
                        <span className="text-muted-foreground">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
