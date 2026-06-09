import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabase: vi.fn(),
}));

import { changePasswordAction } from "@/actions/(user)/profile/change-password";
import { createServerSupabase } from "@/lib/supabase/server";

const mockCreateSupabase = vi.mocked(createServerSupabase);

const VALID_DATA = {
  currentPassword: "OldPass1!",
  newPassword: "NewPass1!",
  confirmNewPassword: "NewPass1!",
};

function makeSupabaseMock({
  user = { id: "user-uuid", email: "user@test.com" } as { id: string; email: string } | null,
  signInError = null as { message: string } | null,
  updateError = null as { message: string; status?: number } | null,
} = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
      signInWithPassword: vi.fn().mockResolvedValue({ error: signInError }),
      updateUser: vi.fn().mockResolvedValue({ error: updateError }),
    },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("changePasswordAction", () => {
  it("retorna erro para senha atual vazia (schema Zod)", async () => {
    const result = await changePasswordAction({
      currentPassword: "",
      newPassword: "NewPass1!",
      confirmNewPassword: "NewPass1!",
    });
    expect(result).toEqual({ success: false, error: "Senha é obrigatória" });
  });

  it("retorna erro quando senhas não coincidem", async () => {
    const result = await changePasswordAction({
      currentPassword: "OldPass1!",
      newPassword: "NewPass1!",
      confirmNewPassword: "DifferentPass1!",
    });
    expect(result).toEqual({ success: false, error: "As senhas não coincidem" });
  });

  it("retorna erro quando nova senha não atende requisitos de complexidade", async () => {
    const result = await changePasswordAction({
      currentPassword: "OldPass1!",
      newPassword: "simples",
      confirmNewPassword: "simples",
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error).toBeTruthy();
  });

  it("retorna erro quando usuário não está autenticado (getUser retorna null)", async () => {
    mockCreateSupabase.mockResolvedValue(makeSupabaseMock({ user: null }) as never);

    const result = await changePasswordAction(VALID_DATA);
    expect(result).toEqual({ success: false, error: "Usuário não autenticado." });
  });

  it("retorna erro de campo quando senha atual está incorreta", async () => {
    mockCreateSupabase.mockResolvedValue(
      makeSupabaseMock({ signInError: { message: "Invalid credentials" } }) as never,
    );

    const result = await changePasswordAction(VALID_DATA);
    expect(result).toEqual({
      success: false,
      error: "A senha atual está incorreta.",
      field: "currentPassword",
    });
  });

  it("retorna erro de campo quando nova senha é igual à atual (status 422)", async () => {
    mockCreateSupabase.mockResolvedValue(
      makeSupabaseMock({ updateError: { message: "Same password", status: 422 } }) as never,
    );

    const result = await changePasswordAction(VALID_DATA);
    expect(result).toEqual({
      success: false,
      error: "A nova senha deve ser diferente da senha atual.",
      field: "newPassword",
    });
  });

  it("retorna erro genérico quando updateUser falha com outro status", async () => {
    mockCreateSupabase.mockResolvedValue(
      makeSupabaseMock({ updateError: { message: "Server error", status: 500 } }) as never,
    );

    const result = await changePasswordAction(VALID_DATA);
    expect(result).toEqual({
      success: false,
      error: "Erro ao atualizar senha. Tente novamente.",
    });
  });

  it("retorna sucesso quando todas as etapas passam", async () => {
    mockCreateSupabase.mockResolvedValue(makeSupabaseMock() as never);

    const result = await changePasswordAction(VALID_DATA);
    expect(result).toEqual({ success: true });
  });

  it("retorna erro de conexão quando createServerSupabase lança exceção", async () => {
    mockCreateSupabase.mockRejectedValue(new Error("Connection refused"));

    const result = await changePasswordAction(VALID_DATA);
    expect(result).toEqual({
      success: false,
      error: "Erro ao conectar ao servidor. Tente novamente.",
    });
  });
});
