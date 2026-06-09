import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/workspace", () => ({ requireWorkspace: vi.fn() }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: { $queryRaw: vi.fn() },
}));

import { getChartDataAction } from "@/actions/(user)/dashboard/get-chart-data";
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";

const mockWorkspace = vi.mocked(requireWorkspace);
const mockQueryRaw = vi.mocked(prisma.$queryRaw);

const MOCK_CTX = {
  user: { id: "user-uuid", email: "u@test.com", name: "T", avatarUrl: null },
  workspaceId: "workspace-uuid-456",
  workspaceRole: "owner" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockWorkspace.mockResolvedValue(MOCK_CTX as never);
  mockQueryRaw.mockResolvedValue([]);
});

describe("getChartDataAction", () => {
  it("retorna erro para parâmetros inválidos (mês 0)", async () => {
    const result = await getChartDataAction(0, 2024, 6);

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Parâmetros inválidos");
  });

  it("retorna N pontos de dados correspondendo ao número de períodos", async () => {
    const result = await getChartDataAction(6, 2024, 6);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(6);
    }
  });

  it("gera labels de meses corretos", async () => {
    const result = await getChartDataAction(3, 2024, 3);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.map((d) => d.month)).toEqual(["Jan", "Fev", "Mar"]);
    }
  });

  it("faz rollback correto ao cruzar virada de ano (Jan volta para Dez do ano anterior)", async () => {
    const result = await getChartDataAction(2, 2024, 4);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.map((d) => d.month)).toEqual(["Nov", "Dez", "Jan", "Fev"]);
    }
  });

  it("preenche zeros para meses sem dados no banco", async () => {
    const result = await getChartDataAction(3, 2024, 2);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].income).toBe(0);
      expect(result.data[0].expense).toBe(0);
    }
  });

  it("mapeia dados do banco corretamente", async () => {
    mockQueryRaw.mockResolvedValue([
      { month: 3, year: 2024, total_income: 2000, total_expense: 800 },
    ]);

    const result = await getChartDataAction(3, 2024, 2);

    expect(result.success).toBe(true);
    if (result.success) {
      const march = result.data.find((d) => d.month === "Mar");
      expect(march?.income).toBe(2000);
      expect(march?.expense).toBe(800);
    }
  });

  it("retorna erro quando queryRaw lança exceção", async () => {
    mockQueryRaw.mockRejectedValue(new Error("DB error"));

    const result = await getChartDataAction(3, 2024, 6);

    expect(result.success).toBe(false);
  });
});
