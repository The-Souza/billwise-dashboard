export function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatRecurrenceDuration(months: number | null): string {
  if (!months) return "";
  if (months % 12 === 0 && months >= 12) {
    const y = months / 12;
    return ` · ${y} ${y === 1 ? "ano" : "anos"}`;
  }
  return ` · ${months} meses`;
}
