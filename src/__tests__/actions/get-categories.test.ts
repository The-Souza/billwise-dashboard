import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: { categories: { findMany: vi.fn() } },
}));

import { getCategoriesAction } from "@/actions/(user)/accounts/get-categories";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockFindMany = vi.mocked(prisma.categories.findMany);

const MOCK_USER = { id: "user-uuid-123", name: "Test", email: "u@test.com", avatarUrl: null };

const MOCK_ROWS = [
  { id: "cat-1", name: "Alimentação", icon: "🍕", type: "expense" as const, is_utility: false },
  { id: "cat-2", name: "Salário", icon: null, type: "income" as const, is_utility: false },
];

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER as never);
  mockFindMany.mockResolvedValue(MOCK_ROWS as never);
});

describe("getCategoriesAction", () => {
  it("retorna lista de categorias mapeada", async () => {
    const result = await getCategoriesAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        id: "cat-1",
        name: "Alimentação",
        icon: "🍕",
        type: "expense",
        isUtility: false,
      });
      expect(result.data[1].icon).toBeNull();
    }
  });

  it("retorna lista vazia quando não há categorias", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getCategoriesAction();

    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toHaveLength(0);
  });

  it("retorna erro quando usuário não está autenticado", async () => {
    mockAuth.mockRejectedValue(new Error("Não autenticado"));

    const result = await getCategoriesAction();

    expect(result.success).toBe(false);
  });

  it("retorna erro quando prisma falha", async () => {
    mockFindMany.mockRejectedValue(new Error("DB error"));

    const result = await getCategoriesAction();

    expect(result.success).toBe(false);
  });
});
