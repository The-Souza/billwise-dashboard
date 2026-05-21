import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({
  requireAuth: vi.fn(),
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
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockFindFirst = vi.mocked(prisma.recurring_rules.findFirst);
const mockTransaction = vi.mocked(prisma.$transaction);

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
const MOCK_USER = {
  id: "user-uuid-123",
  email: "user@test.com",
  name: "Test",
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

describe("deleteRecurringRuleAction", () => {
  it("retorna erro para id vazio", async () => {
    const result = await deleteRecurringRuleAction("");
    expect(result).toEqual({ success: false, error: "ID inválido" });
    expect(mockAuth).not.toHaveBeenCalled();
  });

  it("retorna erro quando regra não pertence ao usuário", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await deleteRecurringRuleAction(VALID_UUID);
    expect(result).toEqual({ success: false, error: "Regra não encontrada" });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("executa a transação e retorna sucesso", async () => {
    mockFindFirst.mockResolvedValue({ id: VALID_UUID } as never);

    const mockDeleteMany = vi.fn().mockResolvedValue({});
    const mockRuleDelete = vi.fn().mockResolvedValue({});
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<void>) => {
      await fn({
        accounts: { deleteMany: mockDeleteMany },
        recurring_rules: { delete: mockRuleDelete },
      });
    });

    const result = await deleteRecurringRuleAction(VALID_UUID);
    expect(result).toEqual({ success: true });
    expect(mockDeleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          recurring_rule_id: VALID_UUID,
          user_id: MOCK_USER.id,
          status: "pending",
        }),
      }),
    );
    expect(mockRuleDelete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: VALID_UUID, user_id: MOCK_USER.id } }),
    );
  });

  it("verifica isolamento por usuário ao buscar a regra", async () => {
    mockFindFirst.mockResolvedValue(null);

    await deleteRecurringRuleAction(VALID_UUID);

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ user_id: MOCK_USER.id }),
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
});
