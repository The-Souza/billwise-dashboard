import { updateRecurringRuleSchema } from "@/schemas/settings/update-recurring-rule";
import { describe, expect, it } from "vitest";

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("updateRecurringRuleSchema", () => {
  it("aceita dados completos", () => {
    expect(
      updateRecurringRuleSchema.safeParse({
        id: VALID_UUID,
        endDate: "2026-01-01",
        recurrenceMonths: 12,
      }).success,
    ).toBe(true);
  });

  it("aceita apenas o id (outros campos são opcionais)", () => {
    expect(
      updateRecurringRuleSchema.safeParse({ id: VALID_UUID }).success,
    ).toBe(true);
  });

  it("aceita endDate e recurrenceMonths nulos", () => {
    expect(
      updateRecurringRuleSchema.safeParse({
        id: VALID_UUID,
        endDate: null,
        recurrenceMonths: null,
      }).success,
    ).toBe(true);
  });

  it("rejeita id inválido com mensagem correta", () => {
    const result = updateRecurringRuleSchema.safeParse({ id: "nao-uuid" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("ID inválido");
  });

  it("rejeita recurrenceMonths negativo", () => {
    expect(
      updateRecurringRuleSchema.safeParse({
        id: VALID_UUID,
        recurrenceMonths: -1,
      }).success,
    ).toBe(false);
  });

  it("rejeita recurrenceMonths fracionado", () => {
    expect(
      updateRecurringRuleSchema.safeParse({
        id: VALID_UUID,
        recurrenceMonths: 1.5,
      }).success,
    ).toBe(false);
  });

  it("rejeita recurrenceMonths absurdamente alto (defesa contra duração sem teto)", () => {
    const result = updateRecurringRuleSchema.safeParse({
      id: VALID_UUID,
      recurrenceMonths: 999 * 12,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Duração muito longa");
  });

  it("aceita recurrenceMonths no limite máximo (100 anos)", () => {
    expect(
      updateRecurringRuleSchema.safeParse({
        id: VALID_UUID,
        recurrenceMonths: 1200,
      }).success,
    ).toBe(true);
  });
});
