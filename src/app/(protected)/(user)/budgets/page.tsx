"use client";

import { deleteBudgetAction } from "@/actions/(user)/budgets/delete-budget";
import {
  BudgetRow,
  getBudgetsAction,
} from "@/actions/(user)/budgets/get-budgets";
import { MonthPicker } from "@/components/ui/month-picker";
import { useDashboardMonth } from "@/hooks/use-dashboard-month";
import { appToast } from "@/utils/app-toast";
import { useState } from "react";
import useSWR from "swr";
import { AddBudgetCard } from "./_components/AddBudgetCard";
import { BudgetCard } from "./_components/BudgetCard";
import { BudgetFormDialog } from "./_components/BudgetFormDialog";
import { BudgetsSkeleton } from "./_components/BudgetsSkeleton";
import { DeleteBudgetDialog } from "./_components/DeleteBudgetDialog";

export default function BudgetsPage() {
  const dashboardMonth = useDashboardMonth();
  const { month, year } = dashboardMonth;

  const {
    data: budgets,
    isLoading,
    mutate,
  } = useSWR(
    ["budgets", month, year],
    () => getBudgetsAction(month, year).then((r) => (r.success ? r.data : [])),
    { revalidateOnFocus: false, dedupingInterval: 30000 },
  );

  const [formDialog, setFormDialog] = useState<{
    open: boolean;
    mode: "create" | "edit";
    budget?: BudgetRow;
    categoryType?: "expense" | "income";
  }>({ open: false, mode: "create" });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    budget: BudgetRow | null;
    isDeleting: boolean;
  }>({ open: false, budget: null, isDeleting: false });

  function handleMonthSelect(m: number, y: number) {
    dashboardMonth.setMonth(m);
    dashboardMonth.setYear(y);
  }

  function openCreate(categoryType: "expense" | "income") {
    setFormDialog({ open: true, mode: "create", categoryType });
  }

  function openEdit(budget: BudgetRow) {
    setFormDialog({ open: true, mode: "edit", budget });
  }

  function openDelete(budget: BudgetRow) {
    setDeleteDialog({ open: true, budget, isDeleting: false });
  }

  async function handleDeleteConfirm() {
    if (!deleteDialog.budget) return;
    setDeleteDialog((prev) => ({ ...prev, isDeleting: true }));
    const result = await deleteBudgetAction(deleteDialog.budget.id);
    if (result.success) {
      mutate();
      setDeleteDialog({ open: false, budget: null, isDeleting: false });
      appToast.success("Orçamento excluído.");
    } else {
      setDeleteDialog((prev) => ({ ...prev, isDeleting: false }));
      appToast.error(result.error);
    }
  }

  const expense = (budgets ?? []).filter((b) => b.categoryType === "expense");
  const income = (budgets ?? []).filter((b) => b.categoryType === "income");

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <h1 className="text-lg font-bold font-heading tracking-tight">
          Orçamentos
        </h1>
        <MonthPicker {...dashboardMonth} onSelect={handleMonthSelect} />
      </div>

      {isLoading ? (
        <BudgetsSkeleton />
      ) : (
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Despesas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {expense.map((b) => (
                <BudgetCard
                  key={b.id}
                  budget={b}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              ))}
              <AddBudgetCard
                label="Novo orçamento de despesa"
                categoryType="expense"
                onClick={openCreate}
              />
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Receitas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {income.map((b) => (
                <BudgetCard
                  key={b.id}
                  budget={b}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              ))}
              <AddBudgetCard
                label="Nova meta de receita"
                categoryType="income"
                onClick={openCreate}
              />
            </div>
          </section>
        </div>
      )}

      <BudgetFormDialog
        open={formDialog.open}
        mode={formDialog.mode}
        budget={formDialog.budget}
        categoryType={formDialog.categoryType}
        month={month}
        year={year}
        onClose={() => setFormDialog((prev) => ({ ...prev, open: false }))}
        onSuccess={() => mutate()}
      />

      <DeleteBudgetDialog
        open={deleteDialog.open}
        budget={deleteDialog.budget}
        isDeleting={deleteDialog.isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setDeleteDialog({ open: false, budget: null, isDeleting: false })
        }
      />
    </div>
  );
}
