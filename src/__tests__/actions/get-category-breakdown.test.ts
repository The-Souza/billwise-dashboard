import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

import { getCategoryBreakdownAction } from "@/actions/(user)/analytics/get-category-breakdown";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockQueryRaw = vi.mocked(prisma.$queryRaw);

const MOCK_USER = { id: "user-uuid-123", email: "u@test.com", name: "T", role: "user" as const, avatarUrl: null };

const makeRow = (overrides: Partial<{
  category_id: string;
  category_name: string;
  category_icon: string | null;
  category_type: string;
  total: number;
  count: number;
}> = {}) => ({
  category_id: "cat-1",
  category_name: "alimentação",
  category_icon: "UtensilsCrossed",
  category_type: "expense",
  total: 500,
  count: 5,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getCategoryBreakdownAction", () => {
  it("retorna erro para parâmetros inválidos", async () => {
    const result = await getCategoryBreakdownAction(0, 2024, 12, 2024, "all");
    expect(result).toEqual({ success: false, error: "Parâmetros inválidos" });
    expect(mockAuth).not.toHaveBeenCalled();
  });

  it("retorna array vazio quando não há categorias", async () => {
    mockQueryRaw.mockResolvedValue([]);
    const result = await getCategoryBreakdownAction(1, 2024, 3, 2024, "all");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toHaveLength(0);
  });

  it("calcula percentage corretamente para categoria única", async () => {
    mockQueryRaw.mockResolvedValue([makeRow({ total: 1000, count: 4 })]);
    const result = await getCategoryBreakdownAction(1, 2024, 3, 2024, "expense");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].percentage).toBe(100);
      expect(result.data[0].average).toBe(250);
    }
  });

  it("calcula percentage corretamente para múltiplas categorias", async () => {
    mockQueryRaw.mockResolvedValue([
      makeRow({ category_id: "cat-1", total: 300, count: 3 }),
      makeRow({ category_id: "cat-2", category_name: "transporte", total: 700, count: 7 }),
    ]);
    const result = await getCategoryBreakdownAction(1, 2024, 3, 2024, "expense");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].percentage).toBeCloseTo(30);
      expect(result.data[1].percentage).toBeCloseTo(70);
    }
  });

  it("calcula percentages separadas para income e expense", async () => {
    mockQueryRaw.mockResolvedValue([
      makeRow({ category_id: "cat-1", category_type: "income", total: 1000, count: 1 }),
      makeRow({ category_id: "cat-2", category_type: "expense", total: 400, count: 2 }),
      makeRow({ category_id: "cat-3", category_type: "expense", total: 600, count: 3 }),
    ]);
    const result = await getCategoryBreakdownAction(1, 2024, 3, 2024, "all");
    expect(result.success).toBe(true);
    if (result.success) {
      const income = result.data.find(d => d.type === "income");
      const exp1 = result.data.find(d => d.categoryId === "cat-2");
      const exp2 = result.data.find(d => d.categoryId === "cat-3");
      expect(income?.percentage).toBe(100);
      expect(exp1?.percentage).toBeCloseTo(40);
      expect(exp2?.percentage).toBeCloseTo(60);
    }
  });

  it("mapeia campos corretamente", async () => {
    mockQueryRaw.mockResolvedValue([makeRow()]);
    const result = await getCategoryBreakdownAction(1, 2024, 3, 2024, "all");
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0]).toMatchObject({
        categoryId: "cat-1",
        categoryName: "alimentação",
        categoryIcon: "UtensilsCrossed",
        type: "expense",
        total: 500,
        count: 5,
        average: 100,
      });
    }
  });

  it("retorna erro genérico quando queryRaw lança exceção", async () => {
    mockQueryRaw.mockRejectedValue(new Error("DB error"));
    const result = await getCategoryBreakdownAction(1, 2024, 12, 2024, "all");
    expect(result).toEqual({ success: false, error: "Erro ao buscar distribuição por categoria" });
  });
});
