import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/workspace", () => ({
  requireWorkspace: vi.fn(),
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

import { createAccountAction } from "@/actions/(user)/accounts/create-account";
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";

const mockWorkspace = vi.mocked(requireWorkspace);
const mockTransaction = vi.mocked(prisma.$transaction);

const CATEGORY_UUID = "223e4567-e89b-12d3-a456-426614174001";
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

function makeTxMock() {
  return {
    accounts: {
      create: vi.fn().mockResolvedValue({ id: "new-account-id" }),
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    account_installments: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    recurring_rules: {
      create: vi.fn().mockResolvedValue({ id: "rule-uuid-001" }),
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

describe("createAccountAction", () => {
  it("retorna erro para dados inválidos (amount zero)", async () => {
    const result = await createAccountAction({ ...BASE_DATA, amount: 0 });
    expect(result).toEqual({ success: false, error: "Dados inválidos" });
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  describe("conta normal (scheduleType: none)", () => {
    it("cria conta e retorna sucesso", async () => {
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      const result = await createAccountAction(BASE_DATA);
      expect(result).toEqual({ success: true });
      expect(tx.accounts.create).toHaveBeenCalledOnce();
    });

    it("usa user_id do usuário autenticado", async () => {
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await createAccountAction(BASE_DATA);

      expect(tx.accounts.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ user_id: MOCK_WORKSPACE_CTX.user.id }),
        }),
      );
    });

    it("define paid_at quando status é paid", async () => {
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await createAccountAction({ ...BASE_DATA, status: "paid" });

      const callData = tx.accounts.create.mock.calls[0][0].data;
      expect(callData.paid_at).toBeInstanceOf(Date);
    });

    it("não define paid_at quando status é pending", async () => {
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await createAccountAction({ ...BASE_DATA, status: "pending" });

      const callData = tx.accounts.create.mock.calls[0][0].data;
      expect(callData.paid_at).toBeNull();
    });
  });

  describe("conta recorrente (scheduleType: recurring)", () => {
    const recurringData = { ...BASE_DATA, scheduleType: "recurring" as const };

    it("cria regra recorrente e conta vinculada", async () => {
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      const result = await createAccountAction(recurringData);
      expect(result).toEqual({ success: true });
      expect(tx.recurring_rules.create).toHaveBeenCalledOnce();
      expect(tx.accounts.create).toHaveBeenCalledOnce();
    });

    it("vincula a conta à regra via recurring_rule_id", async () => {
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await createAccountAction(recurringData);

      const accountData = tx.accounts.create.mock.calls[0][0].data;
      expect(accountData.recurring_rule_id).toBe("rule-uuid-001");
    });

    it("calcula end_date quando recurrenceMonths é informado", async () => {
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await createAccountAction({ ...recurringData, recurrenceMonths: 12 });

      const ruleData = tx.recurring_rules.create.mock.calls[0][0].data;
      expect(ruleData.end_date).toBeInstanceOf(Date);
    });

    it("define end_date como null quando recurrenceMonths não é informado", async () => {
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await createAccountAction({ ...recurringData, recurrenceMonths: null });

      const ruleData = tx.recurring_rules.create.mock.calls[0][0].data;
      expect(ruleData.end_date).toBeNull();
    });
  });

  describe("conta parcelada (scheduleType: installments)", () => {
    const installmentsData = {
      ...BASE_DATA,
      scheduleType: "installments" as const,
      installments: 3,
    };

    it("cria N contas e N registros de installment", async () => {
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      const result = await createAccountAction(installmentsData);
      expect(result).toEqual({ success: true });
      expect(tx.accounts.createMany.mock.calls[0][0].data).toHaveLength(3);
      expect(tx.account_installments.createMany.mock.calls[0][0].data).toHaveLength(3);
    });

    it("divide o valor total igualmente entre as parcelas", async () => {
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await createAccountAction({ ...installmentsData, amount: 300, installments: 3 });

      const accounts = tx.accounts.createMany.mock.calls[0][0].data;
      expect(accounts[0].amount).toBeCloseTo(100);
      expect(accounts[1].amount).toBeCloseTo(100);
      expect(accounts[2].amount).toBeCloseTo(100);
    });

    it("somente a primeira parcela herda o status original, demais ficam pending", async () => {
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await createAccountAction({ ...installmentsData, status: "paid" });

      const accounts = tx.accounts.createMany.mock.calls[0][0].data;
      expect(accounts[0].status).toBe("paid");
      expect(accounts[1].status).toBe("pending");
      expect(accounts[2].status).toBe("pending");
    });

    it("todas as parcelas compartilham o mesmo installment_group_id", async () => {
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await createAccountAction(installmentsData);

      const accounts = tx.accounts.createMany.mock.calls[0][0].data;
      const groupIds = new Set(accounts.map((a: { installment_group_id: string }) => a.installment_group_id));
      expect(groupIds.size).toBe(1);
    });

    it("datas das parcelas avançam mês a mês", async () => {
      const tx = makeTxMock();
      mockTransaction.mockImplementation(async (fn) => fn(tx as never));

      await createAccountAction({ ...installmentsData, accountDate: "2026-04-01" });

      const accounts = tx.accounts.createMany.mock.calls[0][0].data;
      expect(accounts[0].month).toBe(4);
      expect(accounts[1].month).toBe(5);
      expect(accounts[2].month).toBe(6);
    });
  });

  it("retorna erro quando usuário não está autenticado", async () => {
    mockWorkspace.mockRejectedValue(new Error("Não autenticado"));

    const result = await createAccountAction(BASE_DATA);
    expect(result).toEqual({ success: false, error: "Erro ao criar conta" });
  });

  it("retorna erro genérico quando Prisma lança exceção", async () => {
    mockTransaction.mockRejectedValue(new Error("DB error"));

    const result = await createAccountAction(BASE_DATA);
    expect(result).toEqual({ success: false, error: "Erro ao criar conta" });
  });
});
