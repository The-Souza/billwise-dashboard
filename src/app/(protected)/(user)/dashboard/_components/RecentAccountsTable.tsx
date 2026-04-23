import { RecentAccount } from "@/actions/(user)/dashboard/get-recent-accounts";
import { AppBadge, AppBadgeVariant } from "@/components/ui/app-badge";
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
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { capitalizeFirst } from "@/utils/format-text";
import { ArrowRight, icons } from "lucide-react";
import Link from "next/link";

interface RecentAccountTableProps {
  data?: RecentAccount[];
  label: string;
  isLoading?: boolean;
}

const tableHeaders = [
  { label: "Título" },
  { label: "Categoria" },
  { label: "Vencimento" },
  { label: "Status" },
  { label: "Valor", align: "right" as const },
];

const skeletonCells = [
  { width: "w-32" },
  { width: "w-20" },
  { width: "w-20" },
  { width: "w-24" },
  { width: "w-26", cellClass: "flex justify-end" },
];

export function RecentAccountTable({
  data,
  label,
  isLoading,
}: RecentAccountTableProps) {
  return (
    <Card className="flex flex-col flex-1">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-md font-heading">
            Contas recentes
          </CardTitle>
          <CardDescription>Contas em {label}</CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-xs" asChild>
          <Link href="/accounts">
            Ver todas
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        <Table>
          <TableHeader>
            <TableRow className="*:border-border [&>:not(:last-child)]:border-r hover:bg-transparent">
              {tableHeaders.map((header) => (
                <TableHead
                  key={header.label}
                  className={`text-${header.align || "left"}`}
                >
                  {header.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || !data ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow
                  key={i}
                  className="*:border-border [&>:not(:last-child)]:border-r hover:bg-transparent"
                >
                  {skeletonCells.map((cell, index) => (
                    <TableCell key={index} className={cell.cellClass}>
                      <Skeleton className={`h-5 ${cell.width}`} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5}>
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                    <div className="p-3 rounded-full bg-muted">
                      <ArrowRight className="h-5 w-5 text-muted-foreground opacity-50" />
                    </div>
                    <p className="text-sm font-medium">Sem movimentações</p>
                    <p className="text-xs text-muted-foreground">
                      Nenhuma conta registrada neste período.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((account) => {
                const isIncome = account.categoryType === "income";
                const IconComponent = account.categoryIcon
                  ? (icons[
                      account.categoryIcon as keyof typeof icons
                    ] as React.ElementType)
                  : null;
                return (
                  <TableRow
                    key={account.id}
                    className="*:border-border [&>:not(:last-child)]:border-r odd:bg-muted/50 odd:hover:bg-muted/50 hover:bg-transparent"
                  >
                    <TableCell className="font-medium">
                      {capitalizeFirst(account.title)}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        {IconComponent && (
                          <IconComponent className="h-3.5 w-3.5" />
                        )}
                        {account.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {account.dueDate ? formatDate(account.dueDate) : "—"}
                    </TableCell>
                    <TableCell>
                      <AppBadge variant={account.status as AppBadgeVariant} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <span
                        className={
                          isIncome ? "text-emerald-500" : "text-destructive"
                        }
                      >
                        {isIncome ? "+" : "-"} {formatCurrency(account.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
