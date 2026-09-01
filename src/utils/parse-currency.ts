export function parseCurrencyInput(text: string): number | undefined {
  const trimmed = text.trim();

  if (!trimmed.includes(",")) {
    // No comma typed: a single '.' followed by 1-2 digits can't be a valid
    // pt-BR thousands group (always 3 digits), so treat it as a decimal
    // separator — covers keyboards whose decimal key inserts '.' instead of ','.
    const dotMatches = trimmed.match(/\./g);
    if (dotMatches?.length === 1) {
      const decimals = trimmed.split(".")[1]?.length ?? 0;
      if (decimals > 0 && decimals <= 2) {
        const value = parseFloat(trimmed);
        return Number.isNaN(value) ? undefined : value;
      }
    }
  }

  const normalized = trimmed.replace(/\./g, "").replace(",", ".");
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
