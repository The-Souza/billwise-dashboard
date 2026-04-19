import { getInitials } from "@/utils/get-initials";
import { describe, expect, it } from "vitest";

describe("getInitials", () => {
  it("retorna 'BW' para nome nulo", () => {
    expect(getInitials(null)).toBe("BW");
  });

  it("retorna 'BW' para nome undefined", () => {
    expect(getInitials(undefined)).toBe("BW");
  });

  it("retorna 'BW' para string vazia", () => {
    expect(getInitials("")).toBe("BW");
  });

  it("retorna 'BW' para string só com espaços", () => {
    expect(getInitials("   ")).toBe("BW");
  });

  it("retorna primeira letra para nome simples", () => {
    expect(getInitials("João")).toBe("J");
  });

  it("retorna primeira e última inicial para nome composto", () => {
    expect(getInitials("João Silva")).toBe("JS");
  });

  it("retorna primeira e última inicial para nome com múltiplas palavras", () => {
    expect(getInitials("João Carlos da Silva")).toBe("JS");
  });

  it("retorna em maiúsculas", () => {
    expect(getInitials("ana paula")).toBe("AP");
  });
});
