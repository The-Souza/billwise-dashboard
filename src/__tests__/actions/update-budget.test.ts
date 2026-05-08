import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    budgets: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { updateBudgetAction } from "@/actions/(user)/budgets/update-budget";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockFindFirst = vi.mocked(prisma.budgets.findFirst);
const mockUpdate = vi.mocked(prisma.budgets.update);

const VALID_ID = "123e4567-e89b-12d3-a456-426614174000";
const CATEGORY_ID = "223e4567-e89b-12d3-a456-426614174001";
const MOCK_USER = {
  id: "user-uuid-123",
  email: "user@test.com",
  name: "Test",
  role: "user" as const,
  avatarUrl: null,
};

const VALID_DATA = {
  categoryId: CATEGORY_ID,
  limitAmount: 800,
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

describe("updateBudgetAction", () => {
  it("retorna erro para dados inválidos", async () => {
    const result = await updateBudgetAction(VALID_ID, {
      ...VALID_DATA,
      limitAmount: -1,
    });
    expect(result).toEqual({ success: false, error: "Dados inválidos" });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("retorna erro quando orçamento não existe ou não pertence ao usuário", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await updateBudgetAction(VALID_ID, VALID_DATA);
    expect(result).toEqual({
      success: false,
      error: "Orçamento não encontrado",
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("atualiza e retorna sucesso", async () => {
    mockFindFirst.mockResolvedValue({ id: VALID_ID } as never);
    mockUpdate.mockResolvedValue({} as never);

    const result = await updateBudgetAction(VALID_ID, VALID_DATA);
    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: VALID_ID },
        data: { limit_amount: VALID_DATA.limitAmount },
      }),
    );
  });

  it("busca orçamento filtrando por user_id", async () => {
    mockFindFirst.mockResolvedValue({ id: VALID_ID } as never);
    mockUpdate.mockResolvedValue({} as never);

    await updateBudgetAction(VALID_ID, VALID_DATA);

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ user_id: MOCK_USER.id }),
      }),
    );
  });

  it("retorna erro genérico quando Prisma lança exceção", async () => {
    mockFindFirst.mockRejectedValue(new Error("DB error"));

    const result = await updateBudgetAction(VALID_ID, VALID_DATA);
    expect(result).toEqual({
      success: false,
      error: "Erro ao atualizar orçamento",
    });
  });
});
