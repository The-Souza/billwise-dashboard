"use client";

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
import { useAccountsTable } from "@/hooks/use-accounts-table";
import { DashboardMonth } from "@/hooks/use-dashboard-month";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const {
    filters,
    isLoading,
    refetch,
    accounts,
    total,
    page,
    totalPages,
    sortKey,
    sortDir,
    selectedCount,
    rowSelection,
    setRowSelection,
    deleteDialog,
    setDeleteDialog,
    isDeleting,
    handleFiltersChange,
    handleSort,
    handleDeleteSelected,
    handleDeleteSingle,
    handleConfirmDelete,
    PAGE_SIZE,
  } = useAccountsTable({ dashboardMonth });

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: accounts,
    columns: accountColumns(handleDeleteSingle, {
      key: sortKey,
      dir: sortDir,
      onSort: handleSort,
    }),
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
          {isLoading
            ? "0 contas encontradas"
            : selectedCount > 0
              ? `${selectedCount} de ${total} selecionadas`
              : `${total} conta${total !== 1 ? "s" : ""} encontrada${total !== 1 ? "s" : ""}`}
        </p>
        <AccountsFilters
          filters={filters}
          selectedCount={selectedCount}
          categories={categories}
          onFiltersChange={handleFiltersChange}
          onDelete={handleDeleteSelected}
          onImportSuccess={refetch}
        />
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="*:border-border [&>:not(:last-child)]:border-r hover:bg-transparent whitespace-nowrap"
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
                  className="*:border-border [&>:not(:last-child)]:border-r odd:bg-muted/50 odd:hover:bg-muted/50 hover:bg-transparent h-11"
                >
                  {skeletonWidths.map((width, index) => (
                    <TableCell key={index}>
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
                  className="*:border-border [&>:not(:last-child)]:border-r odd:bg-muted/50 odd:hover:bg-muted/50 hover:bg-transparent whitespace-nowrap h-11"
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
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={table.getAllColumns().length}>
                  <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                    <div className="p-3 rounded-full bg-muted">
                      <ChevronRight className="h-5 w-5 text-muted-foreground opacity-50" />
                    </div>
                    <p className="text-sm font-medium">Nenhuma conta</p>
                    <p className="text-xs text-muted-foreground">
                      Nenhuma conta encontrada para este período ou filtro.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {isLoading
            ? "Mostrando 0 contas"
            : total > 0
              ? `Mostrando ${Math.min((page - 1) * PAGE_SIZE + 1, total)}–${Math.min(page * PAGE_SIZE, total)} de ${total} contas`
              : "Nenhuma conta encontrada"}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 transition-transform ease-in hover:scale-103 active:scale-97"
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
            className="h-7 w-7 transition-transform ease-in hover:scale-103 active:scale-97"
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
