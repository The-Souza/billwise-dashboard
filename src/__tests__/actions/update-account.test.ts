import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/workspace", () => ({
  requireWorkspace: vi.fn(),
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    accounts: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { updateAccountAction } from "@/actions/(user)/accounts/update-account";
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";

const mockWorkspace = vi.mocked(requireWorkspace);
const mockFindFirst = vi.mocked(prisma.accounts.findFirst);
const mockTransaction = vi.mocked(prisma.$transaction);

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
const CATEGORY_UUID = "223e4567-e89b-12d3-a456-426614174001";
const RULE_UUID = "323e4567-e89b-12d3-a456-426614174002";
const GROUP_UUID = "423e4567-e89b-12d3-a456-426614174003";
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

const BASE_DATA = {
  title: "Conta de luz",
  amount: 300,
  categoryId: CATEGORY_UUID,
  accountDate: "2026-04-01",
  status: "pending" as const,
  scheduleType: "none" as const,
  editScope: "single" as const,
};

const NORMAL_ACCOUNT = {
  recurring_rule_id: null,
  installment_group_id: null,
  paid_at: null,
  account_installments: [],
};

const RECURRING_ACCOUNT = {
  recurring_rule_id: RULE_UUID,
  installment_group_id: null,
  paid_at: null,
  account_installments: [],
};

const INSTALLMENT_ACCOUNT = {
  recurring_rule_id: null,
  installment_group_id: GROUP_UUID,
  paid_at: null,
  account_installments: [{ installment_number: 1, total_installments: 3 }],
};

function makeTxMock(siblings: { id: string }[] = []) {
  return {
    accounts: {
      update: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue(siblings),
    },
    account_installments: {
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    recurring_rules: {
      update: vi.fn().mockResolvedValue({}),
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockWorkspace.mockResolvedValue(MOCK_WORKSPACE_CTX as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("updateAccountAction", () => {
  it("retorna erro para dados inválidos (amount negativo)", async () => {
    const result = await updateAccountAction(VALID_UUID, { ...BASE_DATA, amount: -1 });
    expect(result).toEqual({ success: false, error: "Dados inválidos" });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("retorna erro quando conta não pertence ao workspace", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await updateAccountAction(VALID_UUID, BASE_DATA);
    expect(result).toEqual({ success: false, error: "Conta não encontrada" });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("busca a conta filtrando por id e workspace_id", async () => {
    mockFindFirst.mockResolvedValue(NORMAL_ACCOUNT as never);
    const tx = makeTxMock();
    mockTransaction.mockImplementation(async (fn) => fn(tx as never));

    await updateAccountAction(VALID_UUID, BASE_DATA);

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: VALID_UUID, workspace_id: WORKSPACE_ID },
      }),
    );
  });

  describe("conta normal — escopo single", () => {
    it("atualiza a conta e retorna sucesso", async () => {
      mockFindFirst.mockResolvedValue(NORMAL_ACCOUNT as never);
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      const result = await updateAccountAction(VALID_UUID, BASE_DATA);
      expect(result).toEqual({ success: true });
      expect(tx.accounts.update).toHaveBeenCalledOnce();
    });

    it("define paid_at ao transitar para status paid", async () => {
      mockFindFirst.mockResolvedValue({ ...NORMAL_ACCOUNT, paid_at: null } as never);
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await updateAccountAction(VALID_UUID, { ...BASE_DATA, status: "paid" });

      const updateData = tx.accounts.update.mock.calls[0][0].data;
      expect(updateData.paid_at).toBeInstanceOf(Date);
    });

    it("preserva paid_at quando conta já estava paga", async () => {
      const existingPaidAt = new Date("2026-03-15");
      mockFindFirst.mockResolvedValue({ ...NORMAL_ACCOUNT, paid_at: existingPaidAt } as never);
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await updateAccountAction(VALID_UUID, { ...BASE_DATA, status: "paid" });

      const updateData = tx.accounts.update.mock.calls[0][0].data;
      expect(updateData.paid_at).toEqual(existingPaidAt);
    });
  });

  describe("conta recorrente", () => {
    it("atualiza a regra recorrente com recurrenceMonths", async () => {
      mockFindFirst.mockResolvedValue(RECURRING_ACCOUNT as never);
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await updateAccountAction(VALID_UUID, { ...BASE_DATA, recurrenceMonths: 6 });

      expect(tx.recurring_rules.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: RULE_UUID } }),
      );
    });

    it("propaga title, amount e category_id na regra quando editScope é future", async () => {
      mockFindFirst.mockResolvedValue(RECURRING_ACCOUNT as never);
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await updateAccountAction(VALID_UUID, { ...BASE_DATA, editScope: "future" });

      const ruleData = tx.recurring_rules.update.mock.calls[0][0].data;
      expect(ruleData.title).toBe(BASE_DATA.title);
      expect(ruleData.amount).toBe(BASE_DATA.amount);
    });

    it("não propaga title/amount/category na regra quando editScope é single", async () => {
      mockFindFirst.mockResolvedValue(RECURRING_ACCOUNT as never);
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await updateAccountAction(VALID_UUID, { ...BASE_DATA, editScope: "single" });

      const ruleData = tx.recurring_rules.update.mock.calls[0][0].data;
      expect(ruleData.title).toBeUndefined();
      expect(ruleData.amount).toBeUndefined();
    });
  });

  describe("conta parcelada — escopo all", () => {
    const SIBLINGS = [
      { id: "sibling-uuid-001" },
      { id: "sibling-uuid-002" },
      { id: "sibling-uuid-003" },
    ];

    it("atualiza todas as contas irmãs e retorna sucesso", async () => {
      mockFindFirst.mockResolvedValue(INSTALLMENT_ACCOUNT as never);
      const tx = makeTxMock(SIBLINGS);
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      const result = await updateAccountAction(VALID_UUID, { ...BASE_DATA, editScope: "all" });
      expect(result).toEqual({ success: true });
      expect(tx.accounts.update).toHaveBeenCalledTimes(3);
    });

    it("busca irmãs filtrando por installment_group_id e workspace_id", async () => {
      mockFindFirst.mockResolvedValue(INSTALLMENT_ACCOUNT as never);
      const tx = makeTxMock(SIBLINGS);
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await updateAccountAction(VALID_UUID, { ...BASE_DATA, editScope: "all" });

      expect(tx.accounts.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            installment_group_id: GROUP_UUID,
            workspace_id: WORKSPACE_ID,
          }),
        }),
      );
    });

    it("atualiza account_installments de cada irmã", async () => {
      mockFindFirst.mockResolvedValue(INSTALLMENT_ACCOUNT as never);
      const tx = makeTxMock(SIBLINGS);
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await updateAccountAction(VALID_UUID, { ...BASE_DATA, editScope: "all" });

      expect(tx.account_installments.updateMany).toHaveBeenCalledTimes(3);
    });

    it("avança due_date mês a mês por irmã", async () => {
      mockFindFirst.mockResolvedValue(INSTALLMENT_ACCOUNT as never);
      const tx = makeTxMock(SIBLINGS);
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await updateAccountAction(VALID_UUID, {
        ...BASE_DATA,
        editScope: "all",
        dueDate: "2026-04-10",
      });

      const firstDue = tx.accounts.update.mock.calls[0][0].data.due_date as Date;
      const secondDue = tx.accounts.update.mock.calls[1][0].data.due_date as Date;
      expect(firstDue.getMonth()).toBe(3); // abril (0-indexed)
      expect(secondDue.getMonth()).toBe(4); // maio
    });
  });

  it("retorna erro quando usuário não está autenticado", async () => {
    mockWorkspace.mockRejectedValue(new Error("Não autenticado"));

    const result = await updateAccountAction(VALID_UUID, BASE_DATA);
    expect(result).toEqual({ success: false, error: "Erro ao atualizar conta" });
  });

  it("retorna erro genérico quando Prisma lança exceção", async () => {
    mockFindFirst.mockRejectedValue(new Error("DB error"));

    const result = await updateAccountAction(VALID_UUID, BASE_DATA);
    expect(result).toEqual({ success: false, error: "Erro ao atualizar conta" });
  });
});
