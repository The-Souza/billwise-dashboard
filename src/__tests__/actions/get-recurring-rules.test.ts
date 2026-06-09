import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/workspace", () => ({ requireWorkspace: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: { recurring_rules: { findMany: vi.fn() } },
}));

import { getRecurringRulesAction } from "@/actions/(user)/settings/get-recurring-rules";
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";

const mockWorkspace = vi.mocked(requireWorkspace);
const mockFindMany = vi.mocked(prisma.recurring_rules.findMany);

const MOCK_CTX = {
  user: { id: "user-uuid", email: "u@test.com", name: "T", avatarUrl: null },
  workspaceId: "workspace-uuid-456",
  workspaceRole: "owner" as const,
};

const MOCK_RULE = {
  id: "rule-1",
  title: "Aluguel",
  amount: "1500.00",
  frequency: "monthly",
  start_date: new Date("2024-01-01"),
  end_date: null,
  recurrence_months: null,
  categories: { name: "Moradia", icon: "🏠", type: "expense" as const },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockWorkspace.mockResolvedValue(MOCK_CTX as never);
  mockFindMany.mockResolvedValue([MOCK_RULE] as never);
});

describe("getRecurringRulesAction", () => {
  it("retorna lista de regras recorrentes mapeada", async () => {
    const result = await getRecurringRulesAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({
        id: "rule-1",
        title: "Aluguel",
        amount: 1500,
        frequency: "monthly",
        startDate: new Date("2024-01-01").toISOString(),
        endDate: null,
        recurrenceMonths: null,
        categoryName: "Moradia",
        categoryIcon: "🏠",
        categoryType: "expense",
      });
    }
  });

  it("retorna lista vazia quando não há regras ativas", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getRecurringRulesAction();

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toHaveLength(0);
  });

  it("mapeia endDate como string ISO quando presente", async () => {
    mockFindMany.mockResolvedValue([{
      ...MOCK_RULE,
      end_date: new Date("2025-12-31"),
    }] as never);

    const result = await getRecurringRulesAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].endDate).toBe(new Date("2025-12-31").toISOString());
    }
  });

  it("filtra por workspace_id ao buscar regras", async () => {
    await getRecurringRulesAction();

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ workspace_id: MOCK_CTX.workspaceId }),
      }),
    );
  });

  it("retorna erro quando prisma falha", async () => {
    mockFindMany.mockRejectedValue(new Error("DB error"));

    const result = await getRecurringRulesAction();

    expect(result.success).toBe(false);
  });
});
