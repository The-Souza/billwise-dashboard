import { describe, expect, it } from "vitest";
import { toKebabCase } from "@/utils/to-kebab-case";

describe("toKebabCase", () => {
  it("converte PascalCase simples para kebab-case", () => {
    expect(toKebabCase("ShoppingCart")).toBe("shopping-cart");
  });

  it("converte nome com uma única palavra", () => {
    expect(toKebabCase("Home")).toBe("home");
  });

  it("converte nome com múltiplas palavras", () => {
    expect(toKebabCase("AlertCircle")).toBe("alert-circle");
  });

  it("insere traço antes de dígitos precedidos por letra minúscula", () => {
    expect(toKebabCase("Building2")).toBe("building-2");
  });

  it("lida com siglas consecutivas em maiúsculo", () => {
    expect(toKebabCase("QRCode")).toBe("qr-code");
  });

  it("retorna string vazia para entrada vazia", () => {
    expect(toKebabCase("")).toBe("");
  });

  it("mantém string já em kebab-case inalterada", () => {
    expect(toKebabCase("already-kebab")).toBe("already-kebab");
  });
});
