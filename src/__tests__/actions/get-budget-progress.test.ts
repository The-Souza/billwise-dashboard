import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/workspace", () => ({ requireWorkspace: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: { $queryRaw: vi.fn() },
}));

import { getBudgetProgressAction } from "@/actions/(user)/dashboard/get-budget-progress";
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";

const mockWorkspace = vi.mocked(requireWorkspace);
const mockQueryRaw = vi.mocked(prisma.$queryRaw);

const MOCK_CTX = {
  user: { id: "user-uuid", email: "u@test.com", name: "T", avatarUrl: null },
  workspaceId: "workspace-uuid-456",
  workspaceRole: "owner" as const,
};

const MOCK_ROW = {
  category_id: "cat-1",
  category_name: "Alimentação",
  category_icon: "🍕",
  budget_amount: 500,
  spent_amount: 200,
  used_percentage: 40,
  category_type: "expense",
};

beforeEach(() => {
  vi.clearAllMocks();
  mockWorkspace.mockResolvedValue(MOCK_CTX as never);
  mockQueryRaw.mockResolvedValue([MOCK_ROW]);
});

describe("getBudgetProgressAction", () => {
  it("retorna lista de progresso de orçamentos mapeada", async () => {
    const result = await getBudgetProgressAction(3, 2024);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        id: "cat-1",
        category: "Alimentação",
        icon: "🍕",
        spent: 200,
        limit: 500,
        usedPercentage: 40,
        type: "expense",
      });
    }
  });

  it("retorna lista vazia quando não há orçamentos", async () => {
    mockQueryRaw.mockResolvedValue([]);

    const result = await getBudgetProgressAction(3, 2024);

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toHaveLength(0);
  });

  it("retorna erro para parâmetros inválidos (mês 13)", async () => {
    const result = await getBudgetProgressAction(13, 2024);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Parâmetros de data inválidos");
    expect(mockQueryRaw).not.toHaveBeenCalled();
  });

  it("retorna erro quando queryRaw lança exceção", async () => {
    mockQueryRaw.mockRejectedValue(new Error("DB error"));

    const result = await getBudgetProgressAction(3, 2024);

    expect(result.success).toBe(false);
  });
});
