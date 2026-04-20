const INCOME_HEALTHY_THRESHOLD = 50;
const EXPENSE_WARNING_THRESHOLD = 70;
const EXPENSE_CRITICAL_THRESHOLD = 90;

export function getStatusClasses(percentage: number, isIncome: boolean) {
  if (isIncome) {
    return {
      bar: "bg-green-500 dark:bg-green-400",
      accent: "border-l-green-500 dark:border-l-green-400",
      badge:
        percentage >= INCOME_HEALTHY_THRESHOLD
          ? "bg-green-500/10 text-green-600 dark:text-green-400"
          : "bg-muted text-muted-foreground",
    };
  }
  if (percentage >= EXPENSE_CRITICAL_THRESHOLD)
    return {
      bar: "bg-destructive",
      accent: "border-l-destructive",
      badge: "bg-destructive/10 text-destructive",
    };
  if (percentage >= EXPENSE_WARNING_THRESHOLD)
    return {
      bar: "bg-amber-500 dark:bg-amber-400",
      accent: "border-l-amber-500 dark:border-l-amber-400",
      badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    };
  return {
    bar: "bg-green-500 dark:bg-green-400",
    accent: "border-l-green-500 dark:border-l-green-400",
    badge: "bg-green-500/10 text-green-600 dark:text-green-400",
  };
}
