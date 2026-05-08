import { exportParamsSchema } from "@/schemas/accounts/export-params";
import { describe, expect, it } from "vitest";

describe("exportParamsSchema", () => {
  it("aceita params completos", () => {
    expect(
      exportParamsSchema.safeParse({ month: 5, year: 2025 }).success,
    ).toBe(true);
  });

  it("aceita objeto vazio (todos os campos são opcionais)", () => {
    expect(exportParamsSchema.safeParse({}).success).toBe(true);
  });

  it("rejeita mês 0", () => {
    expect(
      exportParamsSchema.safeParse({ month: 0, year: 2025 }).success,
    ).toBe(false);
  });

  it("rejeita mês 13", () => {
    expect(
      exportParamsSchema.safeParse({ month: 13, year: 2025 }).success,
    ).toBe(false);
  });

  it("rejeita ano anterior a 2020", () => {
    expect(
      exportParamsSchema.safeParse({ month: 5, year: 2019 }).success,
    ).toBe(false);
  });
});
