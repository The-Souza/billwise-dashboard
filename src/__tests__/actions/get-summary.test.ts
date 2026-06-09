import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/workspace", () => ({ requireWorkspace: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: { $queryRaw: vi.fn() },
}));

import { getSummaryAction } from "@/actions/(user)/dashboard/get-summary";
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";

const mockWorkspace = vi.mocked(requireWorkspace);
const mockQueryRaw = vi.mocked(prisma.$queryRaw);

const MOCK_CTX = {
  user: { id: "user-uuid", email: "u@test.com", name: "T", avatarUrl: null },
  workspaceId: "workspace-uuid-456",
  workspaceRole: "owner" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockWorkspace.mockResolvedValue(MOCK_CTX as never);
});

describe("getSummaryAction", () => {
  it("retorna erro para parâmetros inválidos (mês 13)", async () => {
    const result = await getSummaryAction(13, 2024);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Parâmetros de data inválidos");
  });

  it("retorna resumo com trends calculados", async () => {
    mockQueryRaw
      .mockResolvedValueOnce([{ total_income: 3000, total_expense: 1000, balance: 2000 }])
      .mockResolvedValueOnce([{ total_income: 2000, total_expense: 800, balance: 1200 }]);

    const result = await getSummaryAction(3, 2024);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.balance).toBe(2000);
      expect(result.data.totalIncome).toBe(3000);
      expect(result.data.totalExpense).toBe(1000);
      expect(result.data.balanceTrend).toBeCloseTo(66.7, 0);
      expect(result.data.incomeTrend).toBe(50);
      expect(result.data.expenseTrend).toBe(25);
    }
  });

  it("retorna trend 0 quando mês anterior não tem dados (prev=0)", async () => {
    mockQueryRaw
      .mockResolvedValueOnce([{ total_income: 1000, total_expense: 500, balance: 500 }])
      .mockResolvedValueOnce([]);

    const result = await getSummaryAction(3, 2024);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.balanceTrend).toBe(0);
      expect(result.data.incomeTrend).toBe(0);
      expect(result.data.expenseTrend).toBe(0);
    }
  });

  it("calcula mês anterior corretamente em janeiro (12/ano-1)", async () => {
    mockQueryRaw
      .mockResolvedValueOnce([{ total_income: 1000, total_expense: 500, balance: 500 }])
      .mockResolvedValueOnce([{ total_income: 1000, total_expense: 500, balance: 500 }]);

    await getSummaryAction(1, 2024);

    // Segunda chamada de $queryRaw deve usar month=12, year=2023
    expect(mockQueryRaw).toHaveBeenCalledTimes(2);
  });

  it("retorna zeros quando não há dados no banco", async () => {
    mockQueryRaw.mockResolvedValue([]);

    const result = await getSummaryAction(3, 2024);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.balance).toBe(0);
      expect(result.data.totalIncome).toBe(0);
      expect(result.data.totalExpense).toBe(0);
    }
  });

  it("retorna erro quando queryRaw lança exceção", async () => {
    mockQueryRaw.mockRejectedValue(new Error("DB error"));

    const result = await getSummaryAction(3, 2024);

    expect(result.success).toBe(false);
  });
});
