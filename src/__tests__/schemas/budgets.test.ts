import { budgetFormSchema } from "@/schemas/budgets/budget-form";
import { monthYearSchema, uuidSchema } from "@/schemas/shared/params";
import { describe, expect, it } from "vitest";

describe("budgetFormSchema", () => {
  const validId = "123e4567-e89b-12d3-a456-426614174000";

  it("aceita orçamento válido", () => {
    const result = budgetFormSchema.safeParse({
      categoryId: validId,
      limitAmount: 500,
      month: 4,
      year: 2026,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita categoryId inválido", () => {
    const result = budgetFormSchema.safeParse({
      categoryId: "nao-é-uuid",
      limitAmount: 500,
      month: 4,
      year: 2026,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Categoria inválida");
  });

  it("rejeita limitAmount zero", () => {
    const result = budgetFormSchema.safeParse({
      categoryId: validId,
      limitAmount: 0,
      month: 4,
      year: 2026,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Valor deve ser maior que zero",
    );
  });

  it("rejeita limitAmount negativo", () => {
    const result = budgetFormSchema.safeParse({
      categoryId: validId,
      limitAmount: -100,
      month: 4,
      year: 2026,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita mês fora do intervalo", () => {
    const result = budgetFormSchema.safeParse({
      categoryId: validId,
      limitAmount: 100,
      month: 13,
      year: 2026,
    });
    expect(result.success).toBe(false);
  });
});

describe("monthYearSchema", () => {
  it("aceita mês e ano válidos", () => {
    expect(monthYearSchema.safeParse({ month: 1, year: 2026 }).success).toBe(
      true,
    );
    expect(monthYearSchema.safeParse({ month: 12, year: 2026 }).success).toBe(
      true,
    );
  });

  it("rejeita mês 0 ou 13", () => {
    expect(monthYearSchema.safeParse({ month: 0, year: 2026 }).success).toBe(
      false,
    );
    expect(monthYearSchema.safeParse({ month: 13, year: 2026 }).success).toBe(
      false,
    );
  });

  it("rejeita ano fora do intervalo 2000-2100", () => {
    expect(monthYearSchema.safeParse({ month: 1, year: 1999 }).success).toBe(
      false,
    );
    expect(monthYearSchema.safeParse({ month: 1, year: 2101 }).success).toBe(
      false,
    );
  });
});

describe("uuidSchema", () => {
  it("aceita UUID v4 válido", () => {
    expect(
      uuidSchema.safeParse("123e4567-e89b-12d3-a456-426614174000").success,
    ).toBe(true);
  });

  it("rejeita string aleatória", () => {
    const result = uuidSchema.safeParse("nao-é-uuid");
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("ID inválido");
  });

  it("rejeita string vazia", () => {
    expect(uuidSchema.safeParse("").success).toBe(false);
  });
});
