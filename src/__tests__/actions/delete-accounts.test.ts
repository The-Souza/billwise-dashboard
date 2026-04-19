import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    accounts: {
      findMany: vi.fn(),
    },
    account_installments: {
      deleteMany: vi.fn(),
    },
    recurring_rules: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { deleteAccountsAction } from "@/actions/(user)/accounts/delete-accounts";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockFindMany = vi.mocked(prisma.accounts.findMany);
const mockTransaction = vi.mocked(prisma.$transaction);

const VALID_ID = "123e4567-e89b-12d3-a456-426614174000";
const VALID_ID_2 = "223e4567-e89b-12d3-a456-426614174001";
const MOCK_USER = {
  id: "user-uuid-123",
  email: "user@test.com",
  name: "Test",
  role: "user" as const,
  avatarUrl: null,
};

beforeEach(() => {
  vi.resetAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("deleteAccountsAction", () => {
  it("retorna erro para array vazio", async () => {
    const result = await deleteAccountsAction([]);
    expect(result).toEqual({
      success: false,
      error: "Nenhuma conta selecionada",
    });
    expect(mockAuth).not.toHaveBeenCalled();
  });

  it("retorna erro para UUID inválido", async () => {
    const result = await deleteAccountsAction(["nao-é-uuid"]);
    expect(result).toEqual({ success: false, error: "ID inválido" });
    expect(mockAuth).not.toHaveBeenCalled();
  });

  it("retorna erro quando nenhuma conta é encontrada para o usuário", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await deleteAccountsAction([VALID_ID]);
    expect(result).toEqual({
      success: false,
      error: "Nenhuma conta encontrada",
    });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("executa transação e retorna sucesso com contagem", async () => {
    mockFindMany
      .mockResolvedValueOnce([
        { id: VALID_ID, recurring_rule_id: null, installment_group_id: null },
      ] as never)
      .mockResolvedValueOnce([] as never);

    mockTransaction.mockImplementation(async (fn) =>
      fn({
        account_installments: { deleteMany: vi.fn() },
        accounts: { deleteMany: vi.fn() },
        recurring_rules: { deleteMany: vi.fn() },
      } as never),
    );

    const result = await deleteAccountsAction([VALID_ID]);
    expect(result).toEqual({ success: true, deleted: 1 });
  });

  it("inclui contas irmãs (mesmo installment_group_id) na deleção", async () => {
    const GROUP_ID = "group-uuid-001";

    mockFindMany
      .mockResolvedValueOnce([
        {
          id: VALID_ID,
          recurring_rule_id: null,
          installment_group_id: GROUP_ID,
        },
      ] as never)
      .mockResolvedValueOnce([{ id: VALID_ID }, { id: VALID_ID_2 }] as never);

    const deletedIds: string[] = [];
    mockTransaction.mockImplementation(async (fn) =>
      fn({
        account_installments: { deleteMany: vi.fn() },
        accounts: {
          deleteMany: vi
            .fn()
            .mockImplementation(
              ({ where }: { where: { id: { in: string[] } } }) => {
                deletedIds.push(...where.id.in);
              },
            ),
        },
        recurring_rules: { deleteMany: vi.fn() },
      } as never),
    );

    const result = await deleteAccountsAction([VALID_ID]);
    expect(result).toEqual({ success: true, deleted: 2 });
  });

  it("retorna erro genérico quando Prisma lança exceção", async () => {
    mockFindMany.mockRejectedValue(new Error("DB error"));

    const result = await deleteAccountsAction([VALID_ID]);
    expect(result).toEqual({ success: false, error: "Erro ao excluir contas" });
  });
});
