import { notificationPrefsSchema } from "@/schemas/settings/notification-prefs";
import { describe, expect, it } from "vitest";

const VALID = {
  dueDaysAhead: 3,
  onRecurringGenerated: true,
  onBudgetExceeded: false,
};

describe("notificationPrefsSchema", () => {
  it("aceita prefs válidas", () => {
    expect(notificationPrefsSchema.safeParse(VALID).success).toBe(true);
  });

  it.each([1, 3, 7, 15])("aceita dueDaysAhead=%i", (v) => {
    expect(
      notificationPrefsSchema.safeParse({ ...VALID, dueDaysAhead: v }).success,
    ).toBe(true);
  });

  it("rejeita dueDaysAhead fora dos valores permitidos (2)", () => {
    expect(
      notificationPrefsSchema.safeParse({ ...VALID, dueDaysAhead: 2 }).success,
    ).toBe(false);
  });

  it("rejeita onRecurringGenerated não booleano", () => {
    expect(
      notificationPrefsSchema.safeParse({
        ...VALID,
        onRecurringGenerated: "true",
      }).success,
    ).toBe(false);
  });

  it("rejeita quando campo obrigatório está ausente", () => {
    const { onBudgetExceeded: _, ...rest } = VALID;
    expect(notificationPrefsSchema.safeParse(rest).success).toBe(false);
  });
});
