import { formatCurrencyForInput } from "@/utils/parse-currency";
import { describe, expect, it } from "vitest";

describe("formatCurrencyForInput", () => {
  it("retorna string vazia para undefined", () => {
    expect(formatCurrencyForInput(undefined)).toBe("");
  });

  it("formata inteiro com duas casas decimais", () => {
    expect(formatCurrencyForInput(10)).toBe("10,00");
  });

  it("formata decimal com vírgula", () => {
    expect(formatCurrencyForInput(10.5)).toBe("10,50");
  });

  it("formata valor com separador de milhar", () => {
    expect(formatCurrencyForInput(1500)).toBe("1.500,00");
    expect(formatCurrencyForInput(1500.5)).toBe("1.500,50");
  });

  it("formata valor com múltiplos separadores de milhar", () => {
    expect(formatCurrencyForInput(12345678.9)).toBe("12.345.678,90");
  });

  it("formata zero", () => {
    expect(formatCurrencyForInput(0)).toBe("0,00");
  });

  it("faz round-trip com parseCurrencyInput sem perda de precisão (o bug original)", async () => {
    const { parseCurrencyInput } = await import("@/utils/parse-currency");
    const original = 1234.56;
    const formatted = formatCurrencyForInput(original);
    expect(parseCurrencyInput(formatted)).toBe(original);
  });
});
