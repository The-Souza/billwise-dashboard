import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/workspace", () => ({ requireWorkspace: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: { accounts: { count: vi.fn(), findMany: vi.fn() } },
}));

import { getAccountsAction } from "@/actions/(user)/accounts/get-accounts";
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";

const mockWorkspace = vi.mocked(requireWorkspace);
const mockCount = vi.mocked(prisma.accounts.count);
const mockFindMany = vi.mocked(prisma.accounts.findMany);

const MOCK_CTX = {
  user: { id: "user-uuid", email: "u@test.com", name: "T", avatarUrl: null },
  workspaceId: "workspace-uuid-456",
  workspaceRole: "owner" as const,
};

const MOCK_ROW = {
  id: "acc-1",
  title: "Conta de luz",
  amount: "200.50",
  due_date: new Date("2024-03-10"),
  status: "pending",
  recurring_rule_id: null,
  categories: { name: "Energia", type: "expense", icon: "⚡" },
  account_installments: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockWorkspace.mockResolvedValue(MOCK_CTX as never);
  mockCount.mockResolvedValue(1);
  mockFindMany.mockResolvedValue([MOCK_ROW] as never);
});

describe("getAccountsAction", () => {
  it("retorna lista e total com filtros padrão", async () => {
    const result = await getAccountsAction({ month: 3, year: 2024 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].amount).toBe(200.5);
      expect(result.data[0].isRecurring).toBe(false);
    }
  });

  it("retorna erro para filtros inválidos (mês 0)", async () => {
    const result = await getAccountsAction({ month: 0, year: 2024 });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Filtros inválidos");
    expect(mockCount).not.toHaveBeenCalled();
  });

  it("mapeia conta sem categoria para fallback 'Sem categoria'", async () => {
    mockFindMany.mockResolvedValue([{
      ...MOCK_ROW,
      categories: null,
    }] as never);

    const result = await getAccountsAction({ month: 3, year: 2024 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].category).toBe("Sem categoria");
      expect(result.data[0].categoryType).toBe("expense");
    }
  });

  it("mapeia installment corretamente quando presente", async () => {
    mockFindMany.mockResolvedValue([{
      ...MOCK_ROW,
      account_installments: [{ installment_number: 2, total_installments: 6 }],
    }] as never);

    const result = await getAccountsAction({ month: 3, year: 2024 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].installments).toEqual({ current: 2, total: 6 });
    }
  });

  it("retorna lista vazia quando não há contas", async () => {
    mockCount.mockResolvedValue(0);
    mockFindMany.mockResolvedValue([]);

    const result = await getAccountsAction({ month: 3, year: 2024 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    }
  });

  it("retorna erro quando prisma falha", async () => {
    mockCount.mockRejectedValue(new Error("DB error"));

    const result = await getAccountsAction({ month: 3, year: 2024 });

    expect(result.success).toBe(false);
  });
});
