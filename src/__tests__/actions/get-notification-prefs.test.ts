import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createServerSupabase: vi.fn() }));

import { getNotificationPrefsAction } from "@/actions/(user)/settings/get-notification-prefs";
import { requireAuth } from "@/lib/auth/guards";
import { createServerSupabase } from "@/lib/supabase/server";
import { DEFAULT_NOTIFICATION_PREFS } from "@/schemas/settings/notification-prefs";

const mockAuth = vi.mocked(requireAuth);
const mockCreateSupabase = vi.mocked(createServerSupabase);

const MOCK_USER = { id: "user-uuid-123", name: "Test", email: "u@test.com", avatarUrl: null };

const VALID_PREFS = {
  dueDaysAhead: 3,
  onRecurringGenerated: true,
  onBudgetExceeded: false,
};

function makeSupabaseMock(prefs: unknown, error: unknown = null) {
  const singleMock = vi.fn().mockResolvedValue({ data: prefs ? { notification_prefs: prefs } : null, error });
  const eqMock = vi.fn().mockReturnValue({ single: singleMock });
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
  const fromMock = vi.fn().mockReturnValue({ select: selectMock });
  return { from: fromMock };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER as never);
  mockCreateSupabase.mockResolvedValue(makeSupabaseMock(VALID_PREFS) as never);
});

describe("getNotificationPrefsAction", () => {
  it("retorna prefs válidas do banco", async () => {
    const result = await getNotificationPrefsAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(VALID_PREFS);
    }
  });

  it("retorna prefs padrão quando prefs no banco são inválidas", async () => {
    mockCreateSupabase.mockResolvedValue(
      makeSupabaseMock({ dueDaysAhead: 99, onRecurringGenerated: "sim" }) as never,
    );

    const result = await getNotificationPrefsAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(DEFAULT_NOTIFICATION_PREFS);
    }
  });

  it("retorna erro quando perfil não é encontrado (data null)", async () => {
    mockCreateSupabase.mockResolvedValue(
      makeSupabaseMock(null, { message: "not found" }) as never,
    );

    const result = await getNotificationPrefsAction();

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBe("Perfil não encontrado");
  });

  it("retorna erro quando usuário não está autenticado", async () => {
    mockAuth.mockRejectedValue(new Error("Não autenticado"));

    const result = await getNotificationPrefsAction();

    expect(result.success).toBe(false);
  });
});
