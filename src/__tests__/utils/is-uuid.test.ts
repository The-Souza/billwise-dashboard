import { isUuid } from "@/utils/is-uuid";
import { describe, expect, it } from "vitest";

describe("isUuid", () => {
  it("retorna true para UUID v4 válido em minúsculo", () => {
    expect(isUuid("123e4567-e89b-12d3-a456-426614174000")).toBe(true);
  });

  it("retorna true para UUID com letras maiúsculas (case insensitive)", () => {
    expect(isUuid("123E4567-E89B-12D3-A456-426614174000")).toBe(true);
  });

  it("retorna true para UUID com letras mistas", () => {
    expect(isUuid("123e4567-E89b-12D3-a456-426614174000")).toBe(true);
  });

  it("retorna false para string vazia", () => {
    expect(isUuid("")).toBe(false);
  });

  it("retorna false para string sem hífens", () => {
    expect(isUuid("123e4567e89b12d3a456426614174000")).toBe(false);
  });

  it("retorna false para UUID com segmento incorreto", () => {
    expect(isUuid("123e4567-e89b-12d3-a456-42661417400")).toBe(false);
  });

  it("retorna false para UUID com caracteres não hexadecimais", () => {
    expect(isUuid("123g4567-e89b-12d3-a456-426614174000")).toBe(false);
  });

  it("retorna false para texto arbitrário", () => {
    expect(isUuid("nao-e-um-uuid")).toBe(false);
  });

  it("retorna false para UUID com segmentos a mais", () => {
    expect(isUuid("123e4567-e89b-12d3-a456-426614174000-extra")).toBe(false);
  });
});
