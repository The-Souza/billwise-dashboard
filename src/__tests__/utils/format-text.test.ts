import { capitalizeFirst, formatRecurrenceDuration } from "@/utils/format-text";
import { describe, expect, it } from "vitest";

describe("capitalizeFirst", () => {
  it("capitaliza primeira letra", () => {
    expect(capitalizeFirst("hello")).toBe("Hello");
  });

  it("preserva o restante da string", () => {
    expect(capitalizeFirst("hELLO WORLD")).toBe("HELLO WORLD");
  });

  it("retorna a string original para string vazia", () => {
    expect(capitalizeFirst("")).toBe("");
  });
});

describe("formatRecurrenceDuration", () => {
  it("retorna vazio para null", () => {
    expect(formatRecurrenceDuration(null)).toBe("");
  });

  it("retorna vazio para 0", () => {
    expect(formatRecurrenceDuration(0)).toBe("");
  });

  it("formata meses abaixo de 12", () => {
    expect(formatRecurrenceDuration(6)).toBe(" · 6 meses");
  });

  it("formata exatamente 1 ano (12 meses)", () => {
    expect(formatRecurrenceDuration(12)).toBe(" · 1 ano");
  });

  it("formata 2 anos (24 meses)", () => {
    expect(formatRecurrenceDuration(24)).toBe(" · 2 anos");
  });

  it("não converte 18 meses em anos (não divisível por 12)", () => {
    expect(formatRecurrenceDuration(18)).toBe(" · 18 meses");
  });

  it("não converte 11 meses em anos", () => {
    expect(formatRecurrenceDuration(11)).toBe(" · 11 meses");
  });
});
