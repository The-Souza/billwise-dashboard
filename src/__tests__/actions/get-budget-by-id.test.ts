import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/workspace", () => ({ requireWorkspace: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: { budgets: { findFirst: vi.fn() } },
}));

import { getBudgetByIdAction } from "@/actions/(user)/budgets/get-budget-by-id";
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";

const mockWorkspace = vi.mocked(requireWorkspace);
const mockFindFirst = vi.mocked(prisma.budgets.findFirst);

const VALID_UUID = "a1000000-0000-4000-8000-000000000001";
const WORKSPACE_ID = "b2000000-0000-4000-8000-000000000002";

const MOCK_CTX = {
  user: { id: "user-uuid", email: "u@test.com", name: "T", avatarUrl: null },
  workspaceId: WORKSPACE_ID,
  workspaceRole: "owner" as const,
};

const MOCK_ROW = {
  id: VALID_UUID,
  category_id: "cat-1",
  limit_amount: "500.00",
  month: 3,
  year: 2024,
  categories: { name: "Alimentação" },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockWorkspace.mockResolvedValue(MOCK_CTX as never);
  mockFindFirst.mockResolvedValue(MOCK_ROW as never);
});

describe("getBudgetByIdAction", () => {
  it("retorna erro para ID que não é UUID", async () => {
    const result = await getBudgetByIdAction("nao-e-uuid");

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("ID inválido");
    expect(mockWorkspace).not.toHaveBeenCalled();
  });

  it("retorna erro quando orçamento não é encontrado", async () => {
    mockFindFirst.mockResolvedValue(null as never);

    const result = await getBudgetByIdAction(VALID_UUID);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Orçamento não encontrado");
  });

  it("retorna orçamento encontrado com dados mapeados", async () => {
    const result = await getBudgetByIdAction(VALID_UUID);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(VALID_UUID);
      expect(result.data.limitAmount).toBe(500);
      expect(result.data.categoryName).toBe("Alimentação");
      expect(result.data.month).toBe(3);
      expect(result.data.year).toBe(2024);
    }
  });

  it("filtra por workspace_id ao buscar no banco", async () => {
    await getBudgetByIdAction(VALID_UUID);

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ workspace_id: WORKSPACE_ID }),
      }),
    );
  });

  it("retorna erro quando prisma falha", async () => {
    mockFindFirst.mockRejectedValue(new Error("DB error"));

    const result = await getBudgetByIdAction(VALID_UUID);

    expect(result.success).toBe(false);
  });
});
