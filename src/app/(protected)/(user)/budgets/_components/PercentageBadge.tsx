import { BudgetRow } from "@/actions/(user)/budgets/get-budgets";
import { cn } from "@/lib/utils";
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
        {budget.usedPercentage.toFixed(0)}%
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
        ? `+${(budget.usedPercentage - 100).toFixed(0)}%`
        : `${budget.usedPercentage.toFixed(0)}%`}
    </span>
  );
}
