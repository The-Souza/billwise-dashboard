import { importRowSchema } from "@/schemas/accounts/import-row";
import { describe, expect, it } from "vitest";

const VALID = {
  title: "Conta de luz",
  amount: 150,
  month: 5,
  year: 2025,
};

describe("importRowSchema", () => {
  it("aceita linha válida", () => {
    expect(importRowSchema.safeParse(VALID).success).toBe(true);
  });

  it("rejeita título vazio", () => {
    expect(importRowSchema.safeParse({ ...VALID, title: "" }).success).toBe(
      false,
    );
  });

  it("rejeita amount zero", () => {
    expect(importRowSchema.safeParse({ ...VALID, amount: 0 }).success).toBe(
      false,
    );
  });

  it("rejeita amount negativo", () => {
    expect(importRowSchema.safeParse({ ...VALID, amount: -10 }).success).toBe(
      false,
    );
  });

  it("rejeita mês 0", () => {
    expect(importRowSchema.safeParse({ ...VALID, month: 0 }).success).toBe(
      false,
    );
  });

  it("rejeita mês 13", () => {
    expect(importRowSchema.safeParse({ ...VALID, month: 13 }).success).toBe(
      false,
    );
  });

  it("rejeita ano anterior a 2020", () => {
    expect(importRowSchema.safeParse({ ...VALID, year: 2019 }).success).toBe(
      false,
    );
  });

  it("normaliza status 'pago' para paid", () => {
    const result = importRowSchema.safeParse({ ...VALID, status: "pago" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("paid");
  });

  it("usa 'pending' como status padrão quando ausente", () => {
    const result = importRowSchema.safeParse(VALID);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("pending");
  });
});
