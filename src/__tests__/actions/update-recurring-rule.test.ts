import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/prisma/client", () => ({
  prisma: {
    recurring_rules: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { updateRecurringRuleAction } from "@/actions/(user)/settings/update-recurring-rule";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockFindFirst = vi.mocked(prisma.recurring_rules.findFirst);
const mockUpdate = vi.mocked(prisma.recurring_rules.update);

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";
const MOCK_USER = {
  id: "user-uuid-123",
  email: "user@test.com",
  name: "Test",
  role: "user" as const,
  avatarUrl: null,
};

const VALID_DATA = {
  id: VALID_UUID,
  endDate: "2026-06-01",
  recurrenceMonths: 12,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("updateRecurringRuleAction", () => {
  it("retorna erro para dados inválidos (id não-uuid)", async () => {
    const result = await updateRecurringRuleAction({
      id: "nao-uuid",
      endDate: null,
      recurrenceMonths: null,
    });
    expect(result).toEqual({ success: false, error: "ID inválido" });
    expect(mockAuth).toHaveBeenCalled();
  });

  it("retorna erro quando regra não pertence ao usuário", async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await updateRecurringRuleAction(VALID_DATA);
    expect(result).toEqual({ success: false, error: "Regra não encontrada" });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("atualiza regra e retorna sucesso", async () => {
    mockFindFirst.mockResolvedValue({ id: VALID_UUID } as never);
    mockUpdate.mockResolvedValue({} as never);

    const result = await updateRecurringRuleAction(VALID_DATA);
    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: VALID_UUID, user_id: MOCK_USER.id },
        data: expect.objectContaining({
          recurrence_months: VALID_DATA.recurrenceMonths,
        }),
      }),
    );
  });

  it("atualiza com endDate e recurrenceMonths nulos (sem prazo)", async () => {
    mockFindFirst.mockResolvedValue({ id: VALID_UUID } as never);
    mockUpdate.mockResolvedValue({} as never);

    const result = await updateRecurringRuleAction({
      id: VALID_UUID,
      endDate: null,
      recurrenceMonths: null,
    });
    expect(result).toEqual({ success: true });
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ end_date: null, recurrence_months: null }),
      }),
    );
  });

  it("verifica isolamento por usuário ao buscar a regra", async () => {
    mockFindFirst.mockResolvedValue(null);

    await updateRecurringRuleAction(VALID_DATA);

    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ user_id: MOCK_USER.id }),
      }),
    );
  });

  it("retorna erro genérico quando Prisma lança exceção", async () => {
    mockFindFirst.mockRejectedValue(new Error("DB error"));

    const result = await updateRecurringRuleAction(VALID_DATA);
    expect(result).toEqual({
      success: false,
      error: "Erro ao atualizar regra recorrente",
    });
  });

  it("retorna erro quando usuário não está autenticado", async () => {
    mockAuth.mockRejectedValue(new Error("Não autenticado"));

    const result = await updateRecurringRuleAction(VALID_DATA);
    expect(result).toEqual({ success: false, error: "Erro ao atualizar regra recorrente" });
  });
});
