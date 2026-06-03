import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/workspace", () => ({
  requireWorkspace: vi.fn(),
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
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";

const mockWorkspace = vi.mocked(requireWorkspace);
const mockFindFirst = vi.mocked(prisma.budgets.findFirst);
const mockDelete = vi.mocked(prisma.budgets.delete);

const VALID_ID = "123e4567-e89b-12d3-a456-426614174000";
const WORKSPACE_ID = "workspace-uuid-456";
const MOCK_WORKSPACE_CTX = {
  user: {
    id: "user-uuid-123",
    email: "user@test.com",
    name: "Test User",
    avatarUrl: null,
  },
  workspaceId: WORKSPACE_ID,
  workspaceRole: "owner" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockWorkspace.mockResolvedValue(MOCK_WORKSPACE_CTX as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("deleteBudgetAction", () => {
  it("retorna erro para ID inválido (não UUID)", async () => {
    const result = await deleteBudgetAction("nao-é-uuid");
    expect(result).toEqual({ success: false, error: "ID inválido" });
    expect(mockWorkspace).toHaveBeenCalled();
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

  it("garante que apenas orçamentos do workspace são deletados", async () => {
    mockFindFirst.mockResolvedValue({ id: VALID_ID } as never);
    mockDelete.mockResolvedValue({} as never);

    await deleteBudgetAction(VALID_ID);

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ workspace_id: WORKSPACE_ID }),
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

  it("retorna erro quando usuário não está autenticado", async () => {
    mockWorkspace.mockRejectedValue(new Error("Não autenticado"));

    const result = await deleteBudgetAction(VALID_ID);
    expect(result).toEqual({ success: false, error: "Erro ao excluir orçamento" });
  });
});
