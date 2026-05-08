"use client";

import { createBudgetAction } from "@/actions/(user)/budgets/create-budget";
import { BudgetRow } from "@/actions/(user)/budgets/get-budgets";
import { getCategoriesForBudgetAction } from "@/actions/(user)/budgets/get-categories-for-budget";
import { updateBudgetAction } from "@/actions/(user)/budgets/update-budget";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletIcon } from "lucide-react";
import { SWR_DEFAULT_OPTIONS } from "@/config/swr";
import useSWR from "swr";
import { BudgetForm } from "./BudgetForm";

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

interface BudgetFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  budget?: BudgetRow;
  categoryType?: "expense" | "income";
  month: number;
  year: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function BudgetFormDialog({
  open,
  mode,
  budget,
  categoryType,
  month,
  year,
  onClose,
  onSuccess,
}: BudgetFormDialogProps) {
  const excludeId = mode === "edit" ? budget?.id : undefined;

  const { data: categories, isLoading } = useSWR(
    open ? ["budget-categories", month, year, excludeId] : null,
    () => getCategoriesForBudgetAction(month, year, excludeId),
    SWR_DEFAULT_OPTIONS,
  );

  const budgetDetail =
    mode === "edit" && budget
      ? {
          id: budget.id,
          categoryId: budget.categoryId,
          categoryName: budget.categoryName,
          limitAmount: budget.budgetAmount,
          month: budget.month,
          year: budget.year,
        }
      : undefined;

  async function handleSubmit(data: Parameters<typeof createBudgetAction>[0]) {
    if (mode === "edit" && budget) {
      return updateBudgetAction(budget.id, data);
    }
    return createBudgetAction(data);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100vw-2rem)] rounded-md max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10">
              <WalletIcon className="h-4 w-4 text-primary" />
            </div>
            {mode === "edit"
              ? "Editar orçamento"
              : categoryType === "income"
                ? "Nova meta de receita"
                : "Novo orçamento de despesa"}
          </DialogTitle>
          <DialogDescription className="text-start">
            {mode === "edit"
              ? `Ajuste o limite para ${MONTH_NAMES[month - 1]} de ${year}.`
              : categoryType === "income"
                ? `Defina uma meta de receita para ${MONTH_NAMES[month - 1]} de ${year}.`
                : `Defina um limite de gastos para ${MONTH_NAMES[month - 1]} de ${year}.`}
          </DialogDescription>
        </DialogHeader>

        {isLoading || !categories ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="flex flex-col gap-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-42" />
            </div>
          </div>
        ) : (
          <BudgetForm
            month={month}
            year={year}
            budget={budgetDetail}
            categoryType={categoryType}
            expenseCategories={categories.success ? categories.expense : []}
            incomeCategories={categories.success ? categories.income : []}
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
            onCancel={onClose}
            onSubmit={handleSubmit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
