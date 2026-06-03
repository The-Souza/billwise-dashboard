import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/workspace", () => ({
  requireWorkspace: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    recurring_rules: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { deleteRecurringRuleAction } from "@/actions/(user)/settings/delete-recurring-rule";
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";

const mockWorkspace = vi.mocked(requireWorkspace);
const mockFindFirst = vi.mocked(prisma.recurring_rules.findFirst);
const mockTransaction = vi.mocked(prisma.$transaction);

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
const WORKSPACE_ID = "workspace-uuid-456";
const MOCK_WORKSPACE_CTX = {
  user: {
    id: "user-uuid-123",
    email: "user@test.com",
    name: "Test",
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

describe("deleteRecurringRuleAction", () => {
  it("retorna erro para id vazio", async () => {
    const result = await deleteRecurringRuleAction("");
    expect(result).toEqual({ success: false, error: "ID inválido" });
    expect(mockWorkspace).not.toHaveBeenCalled();
  });

  it("retorna erro quando regra não pertence ao workspace", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await deleteRecurringRuleAction(VALID_UUID);
    expect(result).toEqual({ success: false, error: "Regra não encontrada" });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("executa a transação e retorna sucesso", async () => {
    mockFindFirst.mockResolvedValue({ id: VALID_UUID } as never);

    const mockDeleteMany = vi.fn().mockResolvedValue({});
    const mockRuleDelete = vi.fn().mockResolvedValue({});
    mockTransaction.mockImplementation(async (fn) => {
      await fn({
        accounts: { deleteMany: mockDeleteMany },
        recurring_rules: { delete: mockRuleDelete },
      } as never);
    });

    const result = await deleteRecurringRuleAction(VALID_UUID);
    expect(result).toEqual({ success: true });
    expect(mockDeleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          recurring_rule_id: VALID_UUID,
          workspace_id: WORKSPACE_ID,
          status: "pending",
        }),
      }),
    );
    expect(mockRuleDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: VALID_UUID },
      }),
    );
  });

  it("verifica isolamento por workspace ao buscar a regra", async () => {
    mockFindFirst.mockResolvedValue(null);

    await deleteRecurringRuleAction(VALID_UUID);

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ workspace_id: WORKSPACE_ID }),
      }),
    );
  });

  it("retorna erro genérico quando Prisma lança exceção", async () => {
    mockFindFirst.mockRejectedValue(new Error("DB error"));

    const result = await deleteRecurringRuleAction(VALID_UUID);
    expect(result).toEqual({
      success: false,
      error: "Erro ao excluir regra recorrente",
    });
  });

  it("retorna erro quando usuário não está autenticado", async () => {
    mockWorkspace.mockRejectedValue(new Error("Não autenticado"));

    const result = await deleteRecurringRuleAction(VALID_UUID);
    expect(result).toEqual({
      success: false,
      error: "Erro ao excluir regra recorrente",
    });
  });
});
