import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    budgets: { findMany: vi.fn() },
    categories: { findMany: vi.fn() },
  },
}));

import { getCategoriesForBudgetAction } from "@/actions/(user)/budgets/get-categories-for-budget";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockBudgetsFindMany = vi.mocked(prisma.budgets.findMany);
const mockCategoriesFindMany = vi.mocked(prisma.categories.findMany);

const MOCK_USER = { id: "user-uuid-123", name: "Test", email: "u@test.com", avatarUrl: null };

const MOCK_CATEGORIES = [
  { id: "cat-1", name: "Alimentação", type: "expense" as const, icon: "🍕" },
  { id: "cat-2", name: "Transporte", type: "expense" as const, icon: "🚗" },
  { id: "cat-3", name: "Salário", type: "income" as const, icon: null },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER as never);
  mockBudgetsFindMany.mockResolvedValue([]);
  mockCategoriesFindMany.mockResolvedValue(MOCK_CATEGORIES as never);
});

describe("getCategoriesForBudgetAction", () => {
  it("retorna categorias separadas por tipo quando nenhum budget existe", async () => {
    const result = await getCategoriesForBudgetAction(3, 2024);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.expense).toHaveLength(2);
      expect(result.income).toHaveLength(1);
      expect(result.expense[0].name).toBe("Alimentação");
      expect(result.income[0].name).toBe("Salário");
    }
  });

  it("exclui categorias já usadas em budgets do mesmo mês/ano", async () => {
    mockBudgetsFindMany.mockResolvedValue([{ category_id: "cat-1" }] as never);
    mockCategoriesFindMany.mockResolvedValue([
      { id: "cat-2", name: "Transporte", type: "expense" as const, icon: "🚗" },
      { id: "cat-3", name: "Salário", type: "income" as const, icon: null },
    ] as never);

    const result = await getCategoriesForBudgetAction(3, 2024);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.expense).toHaveLength(1);
      expect(result.expense[0].id).toBe("cat-2");
    }
  });

  it("com excludeBudgetId, não exclui o próprio budget da filtragem", async () => {
    const BUDGET_ID = "d4000000-0000-4000-8000-000000000004";
    mockBudgetsFindMany.mockResolvedValue([]);

    await getCategoriesForBudgetAction(3, 2024, BUDGET_ID);

    expect(mockBudgetsFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: { not: BUDGET_ID } }),
      }),
    );
  });

  it("retorna erro para parâmetros inválidos (mês 13)", async () => {
    const result = await getCategoriesForBudgetAction(13, 2024);

    expect(result.success).toBe(false);
    expect(mockBudgetsFindMany).not.toHaveBeenCalled();
  });

  it("retorna erro para excludeBudgetId que não é UUID", async () => {
    const result = await getCategoriesForBudgetAction(3, 2024, "nao-e-uuid");

    expect(result.success).toBe(false);
  });

  it("retorna erro quando prisma falha", async () => {
    mockBudgetsFindMany.mockRejectedValue(new Error("DB error"));

    const result = await getCategoriesForBudgetAction(3, 2024);

    expect(result.success).toBe(false);
  });
});
