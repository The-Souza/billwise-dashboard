export function parseCurrencyInput(text: string): number | undefined {
  const normalized = text.trim().replace(/\./g, "").replace(",", ".");
  const value = parseFloat(normalized);
  return Number.isNaN(value) ? undefined : value;
}

export function formatCurrencyForInput(value: number | undefined): string {
  if (value === undefined) return "";
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
