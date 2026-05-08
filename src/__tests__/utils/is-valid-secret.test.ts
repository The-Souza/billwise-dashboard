import { isValidSecret } from "@/lib/auth/is-valid-secret";
import { describe, expect, it } from "vitest";

describe("isValidSecret", () => {
  it("retorna true para segredos iguais", () => {
    expect(isValidSecret("my-secret", "my-secret")).toBe(true);
  });

  it("retorna false para segredos diferentes", () => {
    expect(isValidSecret("my-secret", "other-secret")).toBe(false);
  });

  it("retorna false quando provided é null", () => {
    expect(isValidSecret(null, "my-secret")).toBe(false);
  });

  it("retorna false quando expected é undefined", () => {
    expect(isValidSecret("my-secret", undefined)).toBe(false);
  });

  it("retorna false quando ambos são falsy", () => {
    expect(isValidSecret(null, undefined)).toBe(false);
  });

  it("retorna false para string vazia como provided", () => {
    expect(isValidSecret("", "my-secret")).toBe(false);
  });

  it("é sensível a maiúsculas/minúsculas", () => {
    expect(isValidSecret("Secret", "secret")).toBe(false);
  });

  it("retorna false para strings de tamanhos diferentes", () => {
    expect(isValidSecret("short", "much-longer-secret")).toBe(false);
  });
});
