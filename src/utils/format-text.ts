export const formatPercentage = (value: number, decimals = 0): string =>
  `${value.toFixed(decimals)}%`;

export const formatPercentageOverflow = (value: number): string =>
  `+${(value - 100).toFixed(0)}%`;

export const formatCurrencyCompact = (value: number): string =>
  `R$${(value / 1000).toFixed(0)}k`;

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
