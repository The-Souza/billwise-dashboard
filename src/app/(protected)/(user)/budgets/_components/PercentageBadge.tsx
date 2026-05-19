import { BudgetRow } from "@/actions/(user)/budgets/get-budgets";
import { cn } from "@/lib/utils";
import {
  formatPercentage,
  formatPercentageOverflow,
} from "@/utils/format-text";
import { getStatusClasses } from "@/utils/get-status-classes";

export function PercentageBadge({
  budget,
  isIncome,
  classes,
}: {
  budget: BudgetRow;
  isIncome: boolean;
  classes: ReturnType<typeof getStatusClasses>;
}) {
  if (isIncome) {
    return (
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
          classes.badge,
        )}
      >
        {formatPercentage(budget.usedPercentage)}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
        classes.badge,
      )}
    >
      {budget.usedPercentage > 100
        ? formatPercentageOverflow(budget.usedPercentage)
        : formatPercentage(budget.usedPercentage)}
    </span>
  );
}
