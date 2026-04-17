import { BudgetRow } from "@/actions/(user)/budgets/get-budgets";
import { formatCurrency } from "@/utils/format-currency";

export function StatusLabel({
  budget,
  isIncome,
}: {
  budget: BudgetRow;
  isIncome: boolean;
}) {
  if (isIncome) {
    return budget.usedPercentage >= 100 ? (
      <span className="text-green-600 dark:text-green-400 font-medium">
        Meta atingida!
      </span>
    ) : (
      <span className="text-muted-foreground">
        {formatCurrency(Math.abs(budget.remainingAmount))} para a meta
      </span>
    );
  }

  return budget.usedPercentage > 100 ? (
    <span className="text-destructive font-medium">
      {formatCurrency(Math.abs(budget.remainingAmount))} acima do limite
    </span>
  ) : (
    <span className="text-muted-foreground">
      {formatCurrency(budget.remainingAmount)} restante
    </span>
  );
}
