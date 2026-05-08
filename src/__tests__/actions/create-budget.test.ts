import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    budgets: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

import { createBudgetAction } from "@/actions/(user)/budgets/create-budget";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockFindFirst = vi.mocked(prisma.budgets.findFirst);
const mockCreate = vi.mocked(prisma.budgets.create);

const VALID_ID = "123e4567-e89b-12d3-a456-426614174000";
const MOCK_USER = {
  id: "user-uuid-123",
  email: "user@test.com",
  name: "Test",
  role: "user" as const,
  avatarUrl: null,
};

const VALID_DATA = {
  categoryId: VALID_ID,
  limitAmount: 500,
  month: 4,
  year: 2026,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createBudgetAction", () => {
  it("retorna erro para dados inválidos (limitAmount zero)", async () => {
    const result = await createBudgetAction({ ...VALID_DATA, limitAmount: 0 });
    expect(result).toEqual({ success: false, error: "Dados inválidos" });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("retorna erro quando orçamento duplicado para o mês", async () => {
    mockFindFirst.mockResolvedValue({ id: VALID_ID } as never);

    const result = await createBudgetAction(VALID_DATA);
    expect(result).toEqual({
      success: false,
      error: "Já existe um orçamento para esta categoria neste mês",
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("cria orçamento e retorna sucesso", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({} as never);

    const result = await createBudgetAction(VALID_DATA);
    expect(result).toEqual({ success: true });
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          user_id: MOCK_USER.id,
          category_id: VALID_DATA.categoryId,
          limit_amount: VALID_DATA.limitAmount,
          month: VALID_DATA.month,
          year: VALID_DATA.year,
        }),
      }),
    );
  });

  it("verifica isolamento por usuário ao buscar duplicata", async () => {
    mockFindFirst.mockResolvedValue(null);
    mockCreate.mockResolvedValue({} as never);

    await createBudgetAction(VALID_DATA);

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ user_id: MOCK_USER.id }),
      }),
    );
  });

  it("retorna erro genérico quando Prisma lança exceção", async () => {
    mockFindFirst.mockRejectedValue(new Error("DB error"));

    const result = await createBudgetAction(VALID_DATA);
    expect(result).toEqual({
      success: false,
      error: "Erro ao criar orçamento",
    });
  });
});
