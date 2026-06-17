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
import { useQuery } from "@tanstack/react-query";
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

  const { data: categories, isLoading } = useQuery({
    queryKey: ["budget-categories", month, year, excludeId],
    queryFn: () => getCategoriesForBudgetAction(month, year, excludeId),
    enabled: open,
  });

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
          <DialogTitle className="font-heading">
            {mode === "edit"
              ? "Editar orçamento"
              : categoryType === "income"
                ? "Nova meta de receita"
                : "Novo orçamento de despesa"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? `Ajuste o limite para ${MONTH_NAMES[month - 1]} de ${year}.`
              : categoryType === "income"
                ? `Defina uma meta de receita para ${MONTH_NAMES[month - 1]} de ${year}.`
                : `Defina um limite de gastos para ${MONTH_NAMES[month - 1]} de ${year}.`}
          </DialogDescription>
        </DialogHeader>

        <BudgetForm
          month={month}
          year={year}
          budget={budgetDetail}
          categoryType={categoryType}
          isLoadingCategories={isLoading || !categories}
          expenseCategories={categories?.success ? categories.expense : []}
          incomeCategories={categories?.success ? categories.income : []}
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
          onCancel={onClose}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
