import { checkRequirements } from "@/utils/check-requirements";
import { describe, expect, it } from "vitest";

describe("checkRequirements", () => {
  it("retorna todos falso para string vazia", () => {
    expect(checkRequirements("")).toEqual({
      minChar: false,
      upperCase: false,
      lowerCase: false,
      number: false,
      specialChar: false,
    });
  });

  it("minChar é true para 6 ou mais caracteres", () => {
    expect(checkRequirements("abcdef").minChar).toBe(true);
    expect(checkRequirements("abcdefg").minChar).toBe(true);
  });

  it("minChar é false para menos de 6 caracteres", () => {
    expect(checkRequirements("abc").minChar).toBe(false);
    expect(checkRequirements("abcde").minChar).toBe(false);
  });

  it("upperCase é true quando há letra maiúscula", () => {
    expect(checkRequirements("Abcde1@").upperCase).toBe(true);
    expect(checkRequirements("abcDef").upperCase).toBe(true);
  });

  it("upperCase é false quando não há letra maiúscula", () => {
    expect(checkRequirements("abcdef1@").upperCase).toBe(false);
  });

  it("lowerCase é true quando há letra minúscula", () => {
    expect(checkRequirements("ABCde1@").lowerCase).toBe(true);
    expect(checkRequirements("ABCdEF").lowerCase).toBe(true);
  });

  it("lowerCase é false quando não há letra minúscula", () => {
    expect(checkRequirements("ABCDEF1@").lowerCase).toBe(false);
  });

  it("number é true quando há dígito", () => {
    expect(checkRequirements("Abc1@xx").number).toBe(true);
    expect(checkRequirements("0").number).toBe(true);
  });

  it("number é false quando não há dígito", () => {
    expect(checkRequirements("AbcDef@").number).toBe(false);
  });

  it("specialChar é true para cada caractere especial permitido", () => {
    for (const char of ["@", "$", "!", "%", "*", "?", "&"]) {
      expect(checkRequirements(`Abc1${char}`).specialChar).toBe(true);
    }
  });

  it("specialChar é false quando não há caractere especial", () => {
    expect(checkRequirements("AbcDef1").specialChar).toBe(false);
  });

  it("retorna todos verdadeiro para senha forte", () => {
    expect(checkRequirements("Senha1@forte")).toEqual({
      minChar: true,
      upperCase: true,
      lowerCase: true,
      number: true,
      specialChar: true,
    });
  });
});
