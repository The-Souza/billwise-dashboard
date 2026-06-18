"use client";

import type { CategoryBreakdownItem } from "@/actions/(user)/analytics/get-category-breakdown";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CATEGORY_PAGE_SIZE,
  type SortDir,
  type SortKey,
  useCategoryTable,
} from "@/hooks/use-category-table";
import { formatCurrency } from "@/utils/format-currency";
import { capitalizeFirst, formatPercentage } from "@/utils/format-text";
import { ChevronLeft, ChevronRight, icons, RefreshCw } from "lucide-react";

interface CategoryTableProps {
  data?: CategoryBreakdownItem[];
  isLoading?: boolean;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-muted-foreground/40">↕</span>;
  return <span>{dir === "asc" ? "↑" : "↓"}</span>;
}

export function CategoryTable({ data = [], isLoading }: CategoryTableProps) {
  const {
    sortKey,
    sortDir,
    page,
    setPage,
    handleSort,
    sorted,
    totalPages,
    paged,
  } = useCategoryTable(data);

  const headers: { key: SortKey; label: string; className?: string }[] = [
    { key: "categoryName", label: "Categoria" },
    { key: "total", label: "Total", className: "text-right" },
    { key: "count", label: "Transações", className: "text-right" },
    { key: "average", label: "Média", className: "text-right" },
    { key: "percentage", label: "% do total", className: "text-right" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-md">
          Detalhamento por categoria
        </CardTitle>
        <CardDescription>Clique nos cabeçalhos para ordenar</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow className="*:border-border [&>:not(:last-child)]:border-r hover:bg-transparent">
              {headers.map((h) => (
                <TableHead
                  key={h.key}
                  onClick={() => handleSort(h.key)}
                  className={`cursor-pointer select-none hover:text-foreground transition-colors whitespace-nowrap ${h.className ?? ""}`}
                >
                  {h.label}{" "}
                  <SortIcon active={sortKey === h.key} dir={sortDir} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: CATEGORY_PAGE_SIZE }).map((_, i) => (
                <TableRow
                  key={i}
                  className="*:border-border [&>:not(:last-child)]:border-r odd:bg-muted/50 odd:hover:bg-muted/50 hover:bg-transparent h-11"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-md shrink-0" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                  </TableCell>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j} className="text-right">
                      <Skeleton className="h-5 w-16 ml-auto" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  Nenhuma categoria no período selecionado.
                </TableCell>
              </TableRow>
            ) : (
              paged.map((item) => {
                const IconComponent = item.categoryIcon
                  ? (icons[
                      item.categoryIcon as keyof typeof icons
                    ] as React.ElementType)
                  : null;

                return (
                  <TableRow
                    key={item.categoryId}
                    className="*:border-border [&>:not(:last-child)]:border-r odd:bg-muted/50 odd:hover:bg-muted/50 hover:bg-transparent h-11"
                  >
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatCurrency(item.total)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {item.count}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatCurrency(item.average)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatPercentage(item.percentage, 1)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
            <span>
              {page * CATEGORY_PAGE_SIZE + 1}–
              {Math.min((page + 1) * CATEGORY_PAGE_SIZE, sorted.length)} de{" "}
              {sorted.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
