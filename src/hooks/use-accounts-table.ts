"use client";

import { deleteAccountsAction } from "@/actions/(user)/accounts/delete-accounts";
import {
  AccountFilters,
  AccountRow,
  getAccountsAction,
} from "@/actions/(user)/accounts/get-accounts";
import { DashboardMonth } from "@/hooks/use-dashboard-month";
import { AccountSortKey } from "@/schemas/accounts/get-accounts";
import { appToast } from "@/utils/app-toast";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { RowSelectionState } from "@tanstack/react-table";
import { useEffect, useState } from "react";

const PAGE_SIZE = 10;

interface UseAccountsTableProps {
  dashboardMonth: DashboardMonth & {
    setMonth: (m: number) => void;
    setYear: (y: number) => void;
  };
}

export function useAccountsTable({ dashboardMonth }: UseAccountsTableProps) {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilters((prev) => ({ ...prev, month, year, page: 1 }));
    setRowSelection({});
  }, [month, year]);

  const {
    data: result,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["accounts", filters],
    queryFn: () => getAccountsAction(filters),
    placeholderData: keepPreviousData,
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

  function handleSort(key: AccountSortKey) {
    setFilters((prev) => ({
      ...prev,
      sortKey: key,
      sortDir:
        prev.sortKey === key
          ? prev.sortDir === "asc"
            ? "desc"
            : "asc"
          : "desc",
      page: 1,
    }));
    setRowSelection({});
  }

  function handleDeleteSelected() {
    const selected = accounts.filter((_, i) => rowSelection[i] !== undefined);
    setDeleteDialog({ open: true, accounts: selected });
  }

  function handleDeleteSingle(account: AccountRow) {
    setDeleteDialog({ open: true, accounts: [account] });
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    const ids = deleteDialog.accounts.map((a) => a.id);
    const res = await deleteAccountsAction(ids);

    if (res.success) {
      appToast.success(
        res.deleted === 1
          ? "Conta excluída com sucesso."
          : `${res.deleted} contas excluídas com sucesso.`,
      );
      setRowSelection({});
      refetch();
    } else {
      appToast.error(res.error);
    }

    setIsDeleting(false);
    setDeleteDialog({ open: false, accounts: [] });
  }

  return {
    filters,
    isLoading,
    refetch,
    accounts,
    total,
    page,
    totalPages,
    sortKey: filters.sortKey,
    sortDir: filters.sortDir ?? ("desc" as const),
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
  };
}
