import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { getAnalyticsEvolutionAction } from "@/actions/(user)/analytics/get-analytics-evolution";
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

describe("getAnalyticsEvolutionAction", () => {
  it("retorna erro para parâmetros inválidos", async () => {
    const result = await getAnalyticsEvolutionAction(0, 2024, 12, 2024);
    expect(result).toEqual({ success: false, error: "Parâmetros inválidos" });
    expect(mockAuth).not.toHaveBeenCalled();
  });

  it("gera label correto para mês e ano", async () => {
    mockQueryRaw.mockResolvedValue([{ month: 3, year: 2024, total_income: 1000, total_expense: 500 }]);
    const result = await getAnalyticsEvolutionAction(3, 2024, 3, 2024);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].month).toBe("Mar/24");
    }
  });

  it("gera um ponto por mês no intervalo", async () => {
    mockQueryRaw.mockResolvedValue([]);
    const result = await getAnalyticsEvolutionAction(1, 2024, 6, 2024);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(6);
      expect(result.data.map(d => d.month)).toEqual([
        "Jan/24", "Fev/24", "Mar/24", "Abr/24", "Mai/24", "Jun/24",
      ]);
    }
  });

  it("gera pontos corretamente ao cruzar virada de ano", async () => {
    mockQueryRaw.mockResolvedValue([]);
    // Nov/2024 → Fev/2025 = 4 meses
    const result = await getAnalyticsEvolutionAction(11, 2024, 2, 2025);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(4);
      expect(result.data.map(d => d.month)).toEqual(["Nov/24", "Dez/24", "Jan/25", "Fev/25"]);
    }
  });

  it("preenche zeros para meses sem dados no banco", async () => {
    // Apenas Mar/24 tem dados; Jan e Fev ficam zerados
    mockQueryRaw.mockResolvedValue([
      { month: 3, year: 2024, total_income: 2000, total_expense: 800 },
    ]);
    const result = await getAnalyticsEvolutionAction(1, 2024, 3, 2024);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0]).toMatchObject({ month: "Jan/24", income: 0, expense: 0 });
      expect(result.data[1]).toMatchObject({ month: "Fev/24", income: 0, expense: 0 });
      expect(result.data[2]).toMatchObject({ month: "Mar/24", income: 2000, expense: 800 });
    }
  });

  it("retorna erro genérico quando queryRaw lança exceção", async () => {
    mockQueryRaw.mockRejectedValue(new Error("DB error"));
    const result = await getAnalyticsEvolutionAction(1, 2024, 12, 2024);
    expect(result).toEqual({ success: false, error: "Erro ao buscar evolução mensal" });
  });
});
