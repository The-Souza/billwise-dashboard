const INCOME_HEALTHY_THRESHOLD = 50;
const EXPENSE_WARNING_THRESHOLD = 70;
const EXPENSE_CRITICAL_THRESHOLD = 90;

export function getStatusClasses(percentage: number, isIncome: boolean) {
  if (isIncome) {
    return {
      bar: "bg-foreground/70",
      badge:
        percentage >= INCOME_HEALTHY_THRESHOLD
          ? "bg-secondary text-foreground"
          : "bg-muted text-muted-foreground",
    };
  }
  if (percentage >= EXPENSE_CRITICAL_THRESHOLD)
    return {
      bar: "bg-destructive",
      badge: "bg-destructive/10 text-destructive",
    };
  if (percentage >= EXPENSE_WARNING_THRESHOLD)
    return {
      bar: "bg-destructive/50 dark:bg-destructive/85",
      badge: "bg-destructive/5 dark:bg-destructive/25 text-destructive/70 dark:text-destructive",
    };
  return {
    bar: "bg-foreground/70",
    badge: "bg-secondary text-foreground",
  };
}
