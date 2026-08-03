import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/workspace", () => ({
  requireWorkspace: vi.fn(),
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    accounts: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { updateAccountsStatusAction } from "@/actions/(user)/accounts/update-accounts-status";
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";

const mockWorkspace = vi.mocked(requireWorkspace);
const mockFindMany = vi.mocked(prisma.accounts.findMany);
const mockTransaction = vi.mocked(prisma.$transaction);

const VALID_ID = "123e4567-e89b-12d3-a456-426614174000";
const VALID_ID_2 = "223e4567-e89b-12d3-a456-426614174001";
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
  vi.resetAllMocks();
  mockWorkspace.mockResolvedValue(MOCK_WORKSPACE_CTX as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("updateAccountsStatusAction", () => {
  it("retorna erro para array vazio", async () => {
    const result = await updateAccountsStatusAction([], "paid");
    expect(result).toEqual({
      success: false,
      error: "Nenhuma conta selecionada",
    });
    expect(mockWorkspace).toHaveBeenCalled();
  });

  it("retorna erro para UUID inválido", async () => {
    const result = await updateAccountsStatusAction(["nao-é-uuid"], "paid");
    expect(result).toEqual({ success: false, error: "ID inválido" });
  });

  it("retorna erro para status inválido", async () => {
    const result = await updateAccountsStatusAction(
      [VALID_ID],
      "cancelled" as never,
    );
    expect(result).toEqual({ success: false, error: "Status inválido" });
  });

  it("retorna erro quando nenhuma conta é encontrada para o workspace", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await updateAccountsStatusAction([VALID_ID], "paid");
    expect(result).toEqual({
      success: false,
      error: "Nenhuma conta encontrada",
    });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("executa transação e retorna sucesso com contagem", async () => {
    mockFindMany.mockResolvedValue([
      { id: VALID_ID, paid_at: null },
      { id: VALID_ID_2, paid_at: null },
    ] as never);

    const updateCalls: unknown[] = [];
    mockTransaction.mockImplementation(async (fn) =>
      fn({
        accounts: {
          update: vi.fn().mockImplementation((args) => {
            updateCalls.push(args);
          }),
        },
      } as never),
    );

    const result = await updateAccountsStatusAction(
      [VALID_ID, VALID_ID_2],
      "pending",
    );
    expect(result).toEqual({ success: true, updated: 2 });
    expect(updateCalls).toHaveLength(2);
  });

  it("escopa a busca de contas pelo workspace do usuário", async () => {
    mockFindMany.mockResolvedValue([{ id: VALID_ID, paid_at: null }] as never);
    mockTransaction.mockImplementation(async (fn) =>
      fn({ accounts: { update: vi.fn() } } as never),
    );

    await updateAccountsStatusAction([VALID_ID], "paid");
    expect(mockFindMany).toHaveBeenCalledWith({
      where: { id: { in: [VALID_ID] }, workspace_id: WORKSPACE_ID },
      select: { id: true, paid_at: true },
    });
  });

  it("estampa paid_at ao mudar para pago quando ainda não estava pago", async () => {
    mockFindMany.mockResolvedValue([{ id: VALID_ID, paid_at: null }] as never);

    let updateArgs: { data: { paid_at: unknown } } | undefined;
    mockTransaction.mockImplementation(async (fn) =>
      fn({
        accounts: {
          update: vi.fn().mockImplementation((args) => {
            updateArgs = args;
          }),
        },
      } as never),
    );

    await updateAccountsStatusAction([VALID_ID], "paid");
    expect(updateArgs?.data.paid_at).toBeInstanceOf(Date);
  });

  it("mantém paid_at existente ao mudar para pago quando já estava pago", async () => {
    const existingPaidAt = new Date("2026-01-01T00:00:00.000Z");
    mockFindMany.mockResolvedValue([
      { id: VALID_ID, paid_at: existingPaidAt },
    ] as never);

    let updateArgs: { data: { paid_at: unknown } } | undefined;
    mockTransaction.mockImplementation(async (fn) =>
      fn({
        accounts: {
          update: vi.fn().mockImplementation((args) => {
            updateArgs = args;
          }),
        },
      } as never),
    );

    await updateAccountsStatusAction([VALID_ID], "paid");
    expect(updateArgs?.data.paid_at).toBe(existingPaidAt);
  });

  it("não estampa paid_at ao mudar para pendente ou vencido", async () => {
    mockFindMany.mockResolvedValue([{ id: VALID_ID, paid_at: null }] as never);

    let updateArgs: { data: { paid_at: unknown } } | undefined;
    mockTransaction.mockImplementation(async (fn) =>
      fn({
        accounts: {
          update: vi.fn().mockImplementation((args) => {
            updateArgs = args;
          }),
        },
      } as never),
    );

    await updateAccountsStatusAction([VALID_ID], "overdue");
    expect(updateArgs?.data.paid_at).toBeNull();
  });

  it("retorna erro genérico quando Prisma lança exceção", async () => {
    mockFindMany.mockRejectedValue(new Error("DB error"));

    const result = await updateAccountsStatusAction([VALID_ID], "paid");
    expect(result).toEqual({
      success: false,
      error: "Erro ao atualizar status das contas",
    });
  });

  it("retorna erro quando usuário não está autenticado", async () => {
    mockWorkspace.mockRejectedValue(new Error("Não autenticado"));

    const result = await updateAccountsStatusAction([VALID_ID], "paid");
    expect(result).toEqual({
      success: false,
      error: "Erro ao atualizar status das contas",
    });
  });
});
