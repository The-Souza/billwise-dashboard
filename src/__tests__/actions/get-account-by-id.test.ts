import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/workspace", () => ({ requireWorkspace: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: { accounts: { findFirst: vi.fn(), findMany: vi.fn() } },
}));

import { getAccountByIdAction } from "@/actions/(user)/accounts/get-account-by-id";
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";

const mockWorkspace = vi.mocked(requireWorkspace);
const mockFindFirst = vi.mocked(prisma.accounts.findFirst);
const mockFindMany = vi.mocked(prisma.accounts.findMany);

const VALID_UUID = "a1000000-0000-4000-8000-000000000001";
const WORKSPACE_ID = "b2000000-0000-4000-8000-000000000002";
const GROUP_ID = "c3000000-0000-4000-8000-000000000003";

const MOCK_CTX = {
  user: { id: "user-uuid", email: "u@test.com", name: "T", avatarUrl: null },
  workspaceId: WORKSPACE_ID,
  workspaceRole: "owner" as const,
};

const MOCK_ROW = {
  id: VALID_UUID,
  title: "Conta de luz",
  amount: "150.00",
  category_id: "cat-1",
  due_date: new Date("2024-03-10"),
  account_date: new Date("2024-03-01"),
  status: "pending",
  description: null,
  consumption: null,
  days: null,
  month: 3,
  year: 2024,
  recurring_rule_id: null,
  installment_group_id: null,
  categories: { type: "expense", is_utility: true },
  recurring_rules: null,
  account_installments: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockWorkspace.mockResolvedValue(MOCK_CTX as never);
  mockFindFirst.mockResolvedValue(MOCK_ROW as never);
  mockFindMany.mockResolvedValue([]);
});

describe("getAccountByIdAction", () => {
  it("retorna erro para ID que não é UUID", async () => {
    const result = await getAccountByIdAction("nao-e-uuid");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("ID inválido");
    expect(mockWorkspace).not.toHaveBeenCalled();
  });

  it("retorna erro quando conta não é encontrada", async () => {
    mockFindFirst.mockResolvedValue(null as never);

    const result = await getAccountByIdAction(VALID_UUID);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Conta não encontrada");
  });

  it("retorna conta encontrada sem parcelamento", async () => {
    const result = await getAccountByIdAction(VALID_UUID);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(VALID_UUID);
      expect(result.data.amount).toBe(150);
      expect(result.data.isUtility).toBe(true);
      expect(result.data.installments).toHaveLength(0);
      expect(result.data.siblings).toHaveLength(0);
      expect(result.data.installmentGroupId).toBeNull();
    }
  });

  it("busca siblings quando conta tem installment_group_id", async () => {
    mockFindFirst.mockResolvedValue({
      ...MOCK_ROW,
      installment_group_id: GROUP_ID,
      account_installments: [
        { id: "inst-1", installment_number: 1, total_installments: 3, due_date: new Date("2024-03-10"), amount: "150.00", paid_at: null },
      ],
    } as never);

    mockFindMany.mockResolvedValue([
      { id: VALID_UUID, month: 3, year: 2024, amount: "150.00", status: "pending", account_installments: [{ installment_number: 1 }] },
    ] as never);

    const result = await getAccountByIdAction(VALID_UUID);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.installmentGroupId).toBe(GROUP_ID);
      expect(result.data.installments).toHaveLength(1);
      expect(result.data.siblings).toHaveLength(1);
      expect(mockFindMany).toHaveBeenCalledTimes(1);
    }
  });

  it("não busca siblings quando conta não tem installment_group_id", async () => {
    await getAccountByIdAction(VALID_UUID);

    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("retorna erro quando prisma falha", async () => {
    mockFindFirst.mockRejectedValue(new Error("DB error"));

    const result = await getAccountByIdAction(VALID_UUID);

    expect(result.success).toBe(false);
  });
});
