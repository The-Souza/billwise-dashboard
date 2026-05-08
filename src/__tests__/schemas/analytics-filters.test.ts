import { analyticsFiltersSchema } from "@/schemas/analytics/analytics-filters";
import { describe, expect, it } from "vitest";

describe("analyticsFiltersSchema", () => {
  const valid = {
    startMonth: 1,
    startYear: 2024,
    endMonth: 12,
    endYear: 2024,
    type: "all" as const,
  };

  it("aceita filtros válidos", () => {
    expect(analyticsFiltersSchema.safeParse(valid).success).toBe(true);
  });

  it("aceita todos os valores de type", () => {
    expect(analyticsFiltersSchema.safeParse({ ...valid, type: "income" }).success).toBe(true);
    expect(analyticsFiltersSchema.safeParse({ ...valid, type: "expense" }).success).toBe(true);
    expect(analyticsFiltersSchema.safeParse({ ...valid, type: "all" }).success).toBe(true);
  });

  it("rejeita type inválido", () => {
    expect(analyticsFiltersSchema.safeParse({ ...valid, type: "both" }).success).toBe(false);
  });

  it("rejeita startMonth fora de 1–12", () => {
    expect(analyticsFiltersSchema.safeParse({ ...valid, startMonth: 0 }).success).toBe(false);
    expect(analyticsFiltersSchema.safeParse({ ...valid, startMonth: 13 }).success).toBe(false);
  });

  it("rejeita endMonth fora de 1–12", () => {
    expect(analyticsFiltersSchema.safeParse({ ...valid, endMonth: 0 }).success).toBe(false);
    expect(analyticsFiltersSchema.safeParse({ ...valid, endMonth: 13 }).success).toBe(false);
  });

  it("rejeita startYear anterior a 2020", () => {
    expect(analyticsFiltersSchema.safeParse({ ...valid, startYear: 2019 }).success).toBe(false);
  });

  it("rejeita endYear anterior a 2020", () => {
    expect(analyticsFiltersSchema.safeParse({ ...valid, endYear: 2019 }).success).toBe(false);
  });

  it("aceita mês e ano no limite mínimo", () => {
    expect(
      analyticsFiltersSchema.safeParse({ ...valid, startMonth: 1, startYear: 2020 }).success,
    ).toBe(true);
  });

  it("rejeita campos ausentes", () => {
    const { type: _type, ...withoutType } = valid;
    expect(analyticsFiltersSchema.safeParse(withoutType).success).toBe(false);
  });
});
