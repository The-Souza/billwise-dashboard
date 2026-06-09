import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/workspace", () => ({ requireWorkspace: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: { accounts: { findMany: vi.fn() } },
}));

import { getRecentAccountsAction } from "@/actions/(user)/dashboard/get-recent-accounts";
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";

const mockWorkspace = vi.mocked(requireWorkspace);
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
  categories: { name: "Energia", type: "expense", icon: "⚡" },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockWorkspace.mockResolvedValue(MOCK_CTX as never);
  mockFindMany.mockResolvedValue([MOCK_ROW] as never);
});

describe("getRecentAccountsAction", () => {
  it("retorna lista de contas mapeada", async () => {
    const result = await getRecentAccountsAction(3, 2024);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].amount).toBe(200.5);
      expect(result.data[0].category).toBe("Energia");
    }
  });

  it("retorna erro para parâmetros inválidos (mês 0)", async () => {
    const result = await getRecentAccountsAction(0, 2024);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Parâmetros de data inválidos");
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("usa limit padrão de 8", async () => {
    await getRecentAccountsAction(3, 2024);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 8 }),
    );
  });

  it("clamp no máximo de 50", async () => {
    await getRecentAccountsAction(3, 2024, 200);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 50 }),
    );
  });

  it("clamp no mínimo de 1", async () => {
    await getRecentAccountsAction(3, 2024, 0);

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1 }),
    );
  });

  it("mapeia conta sem categoria para fallback", async () => {
    mockFindMany.mockResolvedValue([{ ...MOCK_ROW, categories: null }] as never);

    const result = await getRecentAccountsAction(3, 2024);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].category).toBe("Sem categoria");
      expect(result.data[0].categoryType).toBe("expense");
    }
  });

  it("retorna erro quando prisma falha", async () => {
    mockFindMany.mockRejectedValue(new Error("DB error"));

    const result = await getRecentAccountsAction(3, 2024);

    expect(result.success).toBe(false);
  });
});
