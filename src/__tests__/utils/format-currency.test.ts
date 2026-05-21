import { formatCurrency } from "@/utils/format-currency";
import { describe, expect, it } from "vitest";

describe("formatCurrency", () => {
  it("formata número positivo no padrão pt-BR com símbolo R$", () => {
    const result = formatCurrency(1500);
    expect(result).toContain("1.500");
    expect(result).toContain("R$");
  });

  it("formata zero como R$ 0,00", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0,00");
    expect(result).toContain("R$");
  });

  it("formata número com centavos usando vírgula como separador decimal", () => {
    const result = formatCurrency(99.9);
    expect(result).toContain("99,90");
  });

  it("formata número negativo", () => {
    const result = formatCurrency(-250.5);
    expect(result).toContain("250,50");
    expect(result).toContain("-");
  });

  it("formata número grande com separador de milhar", () => {
    const result = formatCurrency(1000000);
    expect(result).toContain("1.000.000");
  });

  it("usa duas casas decimais", () => {
    const result = formatCurrency(10.1);
    expect(result).toContain("10,10");
  });
});
