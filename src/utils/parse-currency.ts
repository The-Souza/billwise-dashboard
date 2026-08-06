export function parseCurrencyInput(text: string): number | undefined {
  const normalized = text.trim().replace(/\./g, "").replace(",", ".");
  const value = parseFloat(normalized);
  return Number.isNaN(value) ? undefined : value;
}
