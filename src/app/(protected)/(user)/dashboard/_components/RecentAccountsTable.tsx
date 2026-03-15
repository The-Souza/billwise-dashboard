import { RecentAccount } from "@/actions/(user)/get-recent-accounts";
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
import { CircleDollarSign } from "lucide-react";
import Link from "next/link";

interface RecentAccountTableProps {
  data?: RecentAccount[];
  label: string;
  isLoading?: boolean;
}

export function RecentAccountTable({
  data,
  label,
  isLoading,
}: RecentAccountTableProps) {
  return (
    <Card className="flex flex-col flex-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-md font-heading">
            Contas recentes
          </CardTitle>
          <CardDescription className="capitalize">
            Movimentações em {label}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <Link href="/accounts">Ver todas</Link>
          </Button>
          <div className="p-2 rounded-md bg-primary/10">
            <CircleDollarSign className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <Table>
          <TableHeader>
            <TableRow className="*:border-border [&>:not(:last-child)]:border-r hover:bg-transparent">
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || !data ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow
                  key={i}
                  className="*:border-border [&>:not(:last-child)]:border-r hover:bg-transparent"
                >
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </TableCell>
                  <TableCell className="flex justify-end">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-sm text-muted-foreground py-8"
                >
                  Nenhuma movimentação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              data.map((account) => {
                const isIncome = account.categoryType === "income";
                return (
                  <TableRow
                    key={account.id}
                    className="*:border-border [&>:not(:last-child)]:border-r odd:bg-muted/50 odd:hover:bg-muted/50 hover:bg-transparent"
                  >
                    <TableCell className="font-medium">
                      {account.title}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
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
