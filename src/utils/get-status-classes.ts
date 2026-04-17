export function getStatusClasses(percentage: number, isIncome: boolean) {
  if (isIncome) {
    return {
      bar: "bg-green-500 dark:bg-green-400",
      accent: "border-l-green-500 dark:border-l-green-400",
      badge:
        percentage >= 100
          ? "bg-green-500/10 text-green-600 dark:text-green-400"
          : "bg-primary/10 text-primary",
    };
  }
  if (percentage > 100)
    return {
      bar: "bg-destructive",
      accent: "border-l-destructive",
      badge: "bg-destructive/10 text-destructive",
    };
  if (percentage >= 90)
    return {
      bar: "bg-destructive",
      accent: "border-l-destructive",
      badge: "bg-destructive/10 text-destructive",
    };
  if (percentage >= 70)
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
