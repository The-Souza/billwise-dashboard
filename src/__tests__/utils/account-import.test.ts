import {
  formatCellDate,
  normalizeDate,
  normalizeStatus,
  normalizeType,
} from "@/utils/account-import";
import { describe, expect, it } from "vitest";

describe("normalizeDate", () => {
  it("converte formato BR (dd/mm/yyyy) para ISO", () => {
    expect(normalizeDate("25/12/2025")).toBe("2025-12-25");
  });

  it("aceita formato ISO e retorna os primeiros 10 chars", () => {
    expect(normalizeDate("2025-12-25")).toBe("2025-12-25");
  });

  it("trunca datetime ISO para somente a data", () => {
    expect(normalizeDate("2025-12-25T10:30:00Z")).toBe("2025-12-25");
  });

  it("retorna null para null", () => {
    expect(normalizeDate(null)).toBeNull();
  });

  it("retorna null para string vazia", () => {
    expect(normalizeDate("")).toBeNull();
  });

  it("retorna null para formato inválido", () => {
    expect(normalizeDate("data-invalida")).toBeNull();
  });
});

describe("normalizeStatus", () => {
  it("converte 'pago' para paid", () => {
    expect(normalizeStatus("pago")).toBe("paid");
  });

  it("converte 'pendente' para pending", () => {
    expect(normalizeStatus("pendente")).toBe("pending");
  });

  it("converte 'vencido' para overdue", () => {
    expect(normalizeStatus("vencido")).toBe("overdue");
  });

  it("aceita valores em inglês", () => {
    expect(normalizeStatus("paid")).toBe("paid");
    expect(normalizeStatus("pending")).toBe("pending");
    expect(normalizeStatus("overdue")).toBe("overdue");
  });

  it("é case-insensitive", () => {
    expect(normalizeStatus("PAGO")).toBe("paid");
    expect(normalizeStatus("Pendente")).toBe("pending");
  });

  it("usa 'pending' como padrão para valores desconhecidos", () => {
    expect(normalizeStatus("desconhecido")).toBe("pending");
  });
});

describe("normalizeType", () => {
  it("converte 'receita' para income", () => {
    expect(normalizeType("receita")).toBe("income");
  });

  it("converte 'income' para income", () => {
    expect(normalizeType("income")).toBe("income");
  });

  it("retorna expense para qualquer outro valor", () => {
    expect(normalizeType("despesa")).toBe("expense");
  });

  it("retorna expense para null", () => {
    expect(normalizeType(null)).toBe("expense");
  });

  it("retorna expense para string vazia", () => {
    expect(normalizeType("")).toBe("expense");
  });
});

describe("formatCellDate", () => {
  it("formata objeto Date para string ISO (yyyy-mm-dd)", () => {
    expect(formatCellDate(new Date("2025-05-01"))).toBe("2025-05-01");
  });

  it("trunca string datetime para somente a data", () => {
    expect(formatCellDate("2025-05-01T00:00:00Z")).toBe("2025-05-01");
  });

  it("retorna null para null", () => {
    expect(formatCellDate(null)).toBeNull();
  });

  it("retorna null para undefined", () => {
    expect(formatCellDate(undefined)).toBeNull();
  });

  it("retorna null para string vazia", () => {
    expect(formatCellDate("")).toBeNull();
  });
});
