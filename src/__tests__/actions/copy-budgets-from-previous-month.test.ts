import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/workspace", () => ({
  requireWorkspace: vi.fn(),
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    budgets: {
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

import { copyBudgetsFromPreviousMonthAction } from "@/actions/(user)/budgets/copy-budgets-from-previous-month";
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";

const mockWorkspace = vi.mocked(requireWorkspace);
const mockFindMany = vi.mocked(prisma.budgets.findMany);
const mockCreateMany = vi.mocked(prisma.budgets.createMany);

const WORKSPACE_ID = "workspace-uuid-456";
const MOCK_WORKSPACE_CTX = {
  user: { id: "user-uuid-123", email: "u@test.com", name: "Test", avatarUrl: null },
  workspaceId: WORKSPACE_ID,
  workspaceRole: "owner" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockWorkspace.mockResolvedValue(MOCK_WORKSPACE_CTX as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("copyBudgetsFromPreviousMonthAction", () => {
  it("retorna erro para parâmetros inválidos", async () => {
    const result = await copyBudgetsFromPreviousMonthAction(13, 2026);
    expect(result).toEqual({ success: false, error: "Parâmetros inválidos" });
    expect(mockFindMany).not.toHaveBeenCalled();
  });

  it("retorna erro quando não há orçamentos no mês anterior", async () => {
    mockFindMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const result = await copyBudgetsFromPreviousMonthAction(5, 2026);
    expect(result).toEqual({
      success: false,
      error: "Nenhum orçamento encontrado no mês anterior",
    });
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("busca o mês anterior corretamente (abril quando o atual é maio)", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    await copyBudgetsFromPreviousMonthAction(5, 2026);

    expect(mockFindMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          workspace_id: WORKSPACE_ID,
          month: 4,
          year: 2026,
        }),
      }),
    );
  });

  it("faz rollover de ano ao buscar dezembro do ano anterior quando o mês atual é janeiro", async () => {
    mockFindMany.mockResolvedValueOnce([]);

    await copyBudgetsFromPreviousMonthAction(1, 2026);

    expect(mockFindMany).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: expect.objectContaining({
          workspace_id: WORKSPACE_ID,
          month: 12,
          year: 2025,
        }),
      }),
    );
  });

  it("copia orçamentos do mês anterior que ainda não existem no mês atual", async () => {
    mockFindMany
      .mockResolvedValueOnce([
        { category_id: "cat-1", limit_amount: 500 },
        { category_id: "cat-2", limit_amount: 300 },
      ] as never)
      .mockResolvedValueOnce([]);
    mockCreateMany.mockResolvedValue({ count: 2 } as never);

    const result = await copyBudgetsFromPreviousMonthAction(5, 2026);

    expect(result).toEqual({ success: true, copied: 2, skipped: 0 });
    expect(mockCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [
          expect.objectContaining({
            workspace_id: WORKSPACE_ID,
            category_id: "cat-1",
            limit_amount: 500,
            month: 5,
            year: 2026,
          }),
          expect.objectContaining({
            workspace_id: WORKSPACE_ID,
            category_id: "cat-2",
            limit_amount: 300,
            month: 5,
            year: 2026,
          }),
        ],
      }),
    );
  });

  it("pula categorias que já têm orçamento no mês atual", async () => {
    mockFindMany
      .mockResolvedValueOnce([
        { category_id: "cat-1", limit_amount: 500 },
        { category_id: "cat-2", limit_amount: 300 },
      ] as never)
      .mockResolvedValueOnce([{ category_id: "cat-1" }] as never);
    mockCreateMany.mockResolvedValue({ count: 1 } as never);

    const result = await copyBudgetsFromPreviousMonthAction(5, 2026);

    expect(result).toEqual({ success: true, copied: 1, skipped: 1 });
    expect(mockCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: [expect.objectContaining({ category_id: "cat-2" })],
      }),
    );
  });

  it("retorna sucesso com copied:0 quando todas as categorias já existem no mês atual", async () => {
    mockFindMany
      .mockResolvedValueOnce([{ category_id: "cat-1", limit_amount: 500 }] as never)
      .mockResolvedValueOnce([{ category_id: "cat-1" }] as never);

    const result = await copyBudgetsFromPreviousMonthAction(5, 2026);

    expect(result).toEqual({ success: true, copied: 0, skipped: 1 });
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("retorna erro genérico quando Prisma lança exceção", async () => {
    mockFindMany.mockRejectedValue(new Error("DB error"));

    const result = await copyBudgetsFromPreviousMonthAction(5, 2026);
    expect(result).toEqual({
      success: false,
      error: "Erro ao copiar orçamentos do mês anterior",
    });
  });

  it("retorna erro quando usuário não está autenticado", async () => {
    mockWorkspace.mockRejectedValue(new Error("Não autenticado"));

    const result = await copyBudgetsFromPreviousMonthAction(5, 2026);
    expect(result).toEqual({
      success: false,
      error: "Erro ao copiar orçamentos do mês anterior",
    });
  });
});
