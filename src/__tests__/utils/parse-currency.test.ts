import { parseCurrencyInput } from "@/utils/parse-currency";
import { describe, expect, it } from "vitest";

describe("parseCurrencyInput", () => {
  it("retorna undefined para string vazia", () => {
    expect(parseCurrencyInput("")).toBeUndefined();
  });

  it("retorna undefined para texto não numérico", () => {
    expect(parseCurrencyInput("abc")).toBeUndefined();
  });

  it("parseia inteiro simples", () => {
    expect(parseCurrencyInput("10")).toBe(10);
  });

  it("parseia decimal com vírgula", () => {
    expect(parseCurrencyInput("10,5")).toBe(10.5);
    expect(parseCurrencyInput("10,50")).toBe(10.5);
  });

  it("parseia valor com separador de milhar (o bug original)", () => {
    expect(parseCurrencyInput("1.500,00")).toBe(1500);
    expect(parseCurrencyInput("1.500,50")).toBe(1500.5);
  });

  it("parseia valor com múltiplos separadores de milhar", () => {
    expect(parseCurrencyInput("12.345.678,90")).toBe(12345678.9);
  });

  it("parseia zero", () => {
    expect(parseCurrencyInput("0")).toBe(0);
    expect(parseCurrencyInput("0,00")).toBe(0);
  });

  it("ignora espaços nas bordas", () => {
    expect(parseCurrencyInput("  1.500,00  ")).toBe(1500);
  });

  it("trata um único ponto seguido de 1-2 dígitos como separador decimal (teclado com '.' como tecla decimal)", () => {
    expect(parseCurrencyInput("150.50")).toBe(150.5);
    expect(parseCurrencyInput("10.5")).toBe(10.5);
  });

  it("trata um único ponto seguido de 3 dígitos como separador de milhar (nunca decimal em pt-BR)", () => {
    expect(parseCurrencyInput("1.500")).toBe(1500);
  });

  it("trata múltiplos pontos sem vírgula como separadores de milhar", () => {
    expect(parseCurrencyInput("12.345.678")).toBe(12345678);
  });
});
