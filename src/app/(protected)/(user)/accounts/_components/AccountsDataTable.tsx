"use client";

import { deleteAccountsAction } from "@/actions/(user)/accounts/delete-accounts";
import {
  AccountFilters,
  AccountRow,
  getAccountsAction,
} from "@/actions/(user)/accounts/get-accounts";
import { CategoryOption } from "@/actions/(user)/accounts/get-categories";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DashboardMonth } from "@/hooks/use-dashboard-month";
import { appToast } from "@/utils/app-toast";
import {
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { AccountsFilters } from "./AccountsFilters";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { accountColumns } from "./accounts-columns";

interface AccountsDataTableProps {
  dashboardMonth: DashboardMonth & {
    setMonth: (m: number) => void;
    setYear: (y: number) => void;
  };
  categories: CategoryOption[];
}

const PAGE_SIZE = 10;

const skeletonWidths = [
  "w-5",
  "w-32",
  "w-20",
  "w-20",
  "w-24",
  "w-16",
  "w-16",
  "w-24 ml-auto",
  "w-16",
];

export function AccountsDataTable({
  dashboardMonth,
  categories,
}: AccountsDataTableProps) {
  const { month, year } = dashboardMonth;

  const [filters, setFilters] = useState<AccountFilters>({
    month,
    year,
    page: 1,
    pageSize: PAGE_SIZE,
  });

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    accounts: AccountRow[];
  }>({ open: false, accounts: [] });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, month, year, page: 1 }));
    setRowSelection({});
  }, [month, year]);

  const {
    data: result,
    isLoading,
    mutate,
  } = useSWR(["accounts", filters], () => getAccountsAction(filters), {
    keepPreviousData: true,
  });

  const accounts = result?.success ? result.data : [];
  const total = result?.success ? result.total : 0;
  const page = filters.page ?? 1;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const selectedCount = Object.keys(rowSelection).length;

  function handleFiltersChange(partial: Partial<AccountFilters>) {
    setFilters((prev) => ({ ...prev, ...partial }));
    setRowSelection({});
  }

  function handleDeleteSelected() {
    const selectedAccounts = accounts.filter(
      (_, i) => rowSelection[i] !== undefined,
    );
    setDeleteDialog({ open: true, accounts: selectedAccounts });
  }

  function handleDeleteSingle(account: AccountRow) {
    setDeleteDialog({ open: true, accounts: [account] });
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    const ids = deleteDialog.accounts.map((a) => a.id);
    const result = await deleteAccountsAction(ids);

    if (result.success) {
      appToast.success(
        result.deleted === 1
          ? "Conta excluída com sucesso."
          : `${result.deleted} contas excluídas com sucesso.`,
      );
      setRowSelection({});
      mutate();
    } else {
      appToast.error(result.error);
    }

    setIsDeleting(false);
    setDeleteDialog({ open: false, accounts: [] });
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: accounts,
    columns: accountColumns(handleDeleteSingle),
    manualPagination: true,
    pageCount: totalPages,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
      pagination: { pageIndex: page - 1, pageSize: PAGE_SIZE },
    },
  });

  return (
    <div className="flex flex-col gap-3 flex-1">
      <div className="flex flex-col-reverse lg:flex-row justify-between items-start lg:items-end gap-2">
        <p className="text-xs text-muted-foreground">
          {selectedCount > 0
            ? `${selectedCount} de ${total} selecionadas`
            : `${total} conta${total !== 1 ? "s" : ""} encontrada${total !== 1 ? "s" : ""}`}
        </p>
        <AccountsFilters
          filters={filters}
          selectedCount={selectedCount}
          categories={categories}
          onFiltersChange={handleFiltersChange}
          onDelete={handleDeleteSelected}
        />
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="*:border-border [&>:not(:last-child)]:border-r hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.columnDef.meta?.className}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow
                  key={i}
                  className="*:border-border [&>:not(:last-child)]:border-r hover:bg-transparent"
                >
                  {skeletonWidths.map((width, index) => (
                    <TableCell key={index} className="h-11.25">
                      <Skeleton className={`h-5 ${width}`} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="*:border-border [&>:not(:last-child)]:border-r odd:bg-muted/50 odd:hover:bg-muted/50 hover:bg-transparent"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={accountColumns(handleDeleteSingle).length}
                  className="text-center text-sm text-muted-foreground py-8"
                >
                  Nenhuma conta encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {total > 0
            ? `Mostrando ${Math.min((page - 1) * PAGE_SIZE + 1, total)}–${Math.min(page * PAGE_SIZE, total)} de ${total} contas`
            : "Nenhuma conta encontrada"}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleFiltersChange({ page: page - 1 })}
            disabled={page <= 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground px-2">
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleFiltersChange({ page: page + 1 })}
            disabled={page >= totalPages || isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DeleteAccountDialog
        open={deleteDialog.open}
        accounts={deleteDialog.accounts}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ open: false, accounts: [] })}
        isDeleting={isDeleting}
      />
    </div>
  );
}
