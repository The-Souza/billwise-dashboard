"use client";

import { deleteAccountsAction } from "@/actions/(user)/accounts/delete-accounts";
import {
  AccountFilters,
  AccountRow,
  getAccountsAction,
} from "@/actions/(user)/accounts/get-accounts";
import { SWR_DEFAULT_OPTIONS } from "@/config/swr";
import { DashboardMonth } from "@/hooks/use-dashboard-month";
import { appToast } from "@/utils/app-toast";
import { RowSelectionState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import useSWR from "swr";

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
    mutate,
  } = useSWR(["accounts", filters], () => getAccountsAction(filters), {
    keepPreviousData: true,
    ...SWR_DEFAULT_OPTIONS,
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
      mutate();
    } else {
      appToast.error(res.error);
    }

    setIsDeleting(false);
    setDeleteDialog({ open: false, accounts: [] });
  }

  return {
    filters,
    isLoading,
    mutate,
    accounts,
    total,
    page,
    totalPages,
    selectedCount,
    rowSelection,
    setRowSelection,
    deleteDialog,
    setDeleteDialog,
    isDeleting,
    handleFiltersChange,
    handleDeleteSelected,
    handleDeleteSingle,
    handleConfirmDelete,
    PAGE_SIZE,
  };
}
