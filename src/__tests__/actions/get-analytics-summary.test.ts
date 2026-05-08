import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { getAnalyticsSummaryAction } from "@/actions/(user)/analytics/get-analytics-summary";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockQueryRaw = vi.mocked(prisma.$queryRaw);

const MOCK_USER = { id: "user-uuid-123", email: "u@test.com", name: "T", role: "user" as const, avatarUrl: null };

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getAnalyticsSummaryAction", () => {
  it("retorna erro para parâmetros inválidos (mês 0)", async () => {
    const result = await getAnalyticsSummaryAction(0, 2024, 12, 2024);
    expect(result).toEqual({ success: false, error: "Parâmetros inválidos" });
    expect(mockAuth).not.toHaveBeenCalled();
  });

  it("retorna erro para ano inferior a 2020", async () => {
    const result = await getAnalyticsSummaryAction(1, 2019, 12, 2024);
    expect(result).toEqual({ success: false, error: "Parâmetros inválidos" });
  });

  it("calcula monthCount corretamente para 1 mês", async () => {
    mockQueryRaw.mockResolvedValue([{ total_income: 1000, total_expense: 500, balance: 500 }]);
    const result = await getAnalyticsSummaryAction(3, 2024, 3, 2024);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.monthCount).toBe(1);
      expect(result.data.avgMonthlyExpense).toBe(500);
      expect(result.data.avgMonthlyIncome).toBe(1000);
    }
  });

  it("calcula monthCount corretamente para intervalo que cruza ano", async () => {
    mockQueryRaw.mockResolvedValue([{ total_income: 0, total_expense: 0, balance: 0 }]);
    // Nov/2024 → Fev/2025 = 4 meses
    const result = await getAnalyticsSummaryAction(11, 2024, 2, 2025);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.monthCount).toBe(4);
    }
  });

  it("calcula monthCount para 6 meses consecutivos", async () => {
    mockQueryRaw.mockResolvedValue([{ total_income: 6000, total_expense: 3000, balance: 3000 }]);
    const result = await getAnalyticsSummaryAction(1, 2024, 6, 2024);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.monthCount).toBe(6);
      expect(result.data.avgMonthlyExpense).toBe(500);
    }
  });

  it("retorna zeros quando não há dados no banco", async () => {
    mockQueryRaw.mockResolvedValue([]);
    const result = await getAnalyticsSummaryAction(1, 2024, 3, 2024);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalIncome).toBe(0);
      expect(result.data.totalExpense).toBe(0);
      expect(result.data.balance).toBe(0);
    }
  });

  it("retorna erro genérico quando queryRaw lança exceção", async () => {
    mockQueryRaw.mockRejectedValue(new Error("DB error"));
    const result = await getAnalyticsSummaryAction(1, 2024, 12, 2024);
    expect(result).toEqual({ success: false, error: "Erro ao buscar resumo do período" });
  });
});
