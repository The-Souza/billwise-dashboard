import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    budgets: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { deleteBudgetAction } from "@/actions/(user)/budgets/delete-budget";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockFindFirst = vi.mocked(prisma.budgets.findFirst);
const mockDelete = vi.mocked(prisma.budgets.delete);

const VALID_ID = "123e4567-e89b-12d3-a456-426614174000";
const MOCK_USER = {
  id: "user-uuid-123",
  email: "user@test.com",
  name: "Test User",
  role: "user" as const,
  avatarUrl: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("deleteBudgetAction", () => {
  it("retorna erro para ID inválido (não UUID)", async () => {
    const result = await deleteBudgetAction("nao-é-uuid");
    expect(result).toEqual({ success: false, error: "ID inválido" });
    expect(mockAuth).not.toHaveBeenCalled();
  });

  it("retorna erro quando orçamento não é encontrado", async () => {
    mockFindFirst.mockResolvedValue(null);
    const result = await deleteBudgetAction(VALID_ID);
    expect(result).toEqual({
      success: false,
      error: "Orçamento não encontrado",
    });
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("deleta e retorna sucesso quando orçamento existe", async () => {
    mockFindFirst.mockResolvedValue({ id: VALID_ID } as never);
    mockDelete.mockResolvedValue({} as never);

    const result = await deleteBudgetAction(VALID_ID);
    expect(result).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: VALID_ID } });
  });

  it("garante que apenas orçamentos do próprio usuário são deletados", async () => {
    mockFindFirst.mockResolvedValue({ id: VALID_ID } as never);
    mockDelete.mockResolvedValue({} as never);

    await deleteBudgetAction(VALID_ID);

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ user_id: MOCK_USER.id }),
      }),
    );
  });

  it("retorna erro genérico quando Prisma lança exceção", async () => {
    mockFindFirst.mockRejectedValue(new Error("DB error"));
    const result = await deleteBudgetAction(VALID_ID);
    expect(result).toEqual({
      success: false,
      error: "Erro ao excluir orçamento",
    });
  });
});
