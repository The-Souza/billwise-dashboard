import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { updateNotificationPrefsAction } from "@/actions/(user)/settings/update-notification-prefs";
import { requireAuth } from "@/lib/auth/guards";
import { createServerSupabase } from "@/lib/supabase/server";

const mockAuth = vi.mocked(requireAuth);
const mockCreateSupabase = vi.mocked(createServerSupabase);

const MOCK_USER = {
  id: "user-uuid-123",
  email: "user@test.com",
  name: "Test",
  avatarUrl: null,
};

const VALID_DATA = {
  dueDaysAhead: 3 as const,
  onRecurringGenerated: true,
  onBudgetExceeded: false,
};

function makeSupabaseMock(updateError: unknown = null) {
  const eqMock = vi.fn().mockResolvedValue({ error: updateError });
  const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
  const fromMock = vi.fn().mockReturnValue({ update: updateMock });
  return { from: fromMock };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER as never);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("updateNotificationPrefsAction", () => {
  it("retorna erro para dados inválidos (dueDaysAhead fora dos valores permitidos)", async () => {
    const result = await updateNotificationPrefsAction({
      dueDaysAhead: 5 as never,
      onRecurringGenerated: true,
      onBudgetExceeded: true,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBeTruthy();
  });

  it("retorna erro quando Supabase retorna erro na atualização", async () => {
    mockCreateSupabase.mockResolvedValue(
      makeSupabaseMock({ message: "DB error", code: "500" }) as never,
    );

    const result = await updateNotificationPrefsAction(VALID_DATA);
    expect(result).toEqual({ success: false, error: "Erro ao salvar preferências" });
  });

  it("retorna sucesso e chama revalidatePath quando tudo ocorre corretamente", async () => {
    mockCreateSupabase.mockResolvedValue(makeSupabaseMock() as never);
    const { revalidatePath } = await import("next/cache");

    const result = await updateNotificationPrefsAction(VALID_DATA);
    expect(result).toEqual({ success: true });
    expect(vi.mocked(revalidatePath)).toHaveBeenCalledWith("/settings");
  });

  it("filtra por user_id ao atualizar no Supabase", async () => {
    const mock = makeSupabaseMock();
    mockCreateSupabase.mockResolvedValue(mock as never);

    await updateNotificationPrefsAction(VALID_DATA);

    const eqMock = mock.from("profiles").update({}).eq as ReturnType<typeof vi.fn>;
    expect(eqMock).toHaveBeenCalledWith("id", MOCK_USER.id);
  });

  it("retorna erro quando usuário não está autenticado", async () => {
    mockAuth.mockRejectedValue(new Error("Não autenticado"));

    const result = await updateNotificationPrefsAction(VALID_DATA);
    expect(result).toEqual({
      success: false,
      error: "Erro ao salvar preferências de notificação",
    });
  });
});
