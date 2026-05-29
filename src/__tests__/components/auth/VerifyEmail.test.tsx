import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/actions/auth/verify-email", () => ({
  resendConfirmationAction: vi.fn(),
}));

vi.mock("@/utils/app-toast", () => ({
  appToast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

vi.mock("@/lib/supabase/client", () => ({
  createClientSupabase: () => ({
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  }),
}));

import { VerifyEmail } from "@/app/(auth)/auth/verify-email/_components/VerifyEmail";
import { resendConfirmationAction } from "@/actions/auth/verify-email";
import { appToast } from "@/utils/app-toast";

const mockResend = vi.mocked(resendConfirmationAction);
const mockToast = vi.mocked(appToast);

describe("VerifyEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza o email recebido por prop", () => {
    render(<VerifyEmail email="guilherme@test.com" />);
    expect(screen.getByText("guilherme@test.com")).toBeInTheDocument();
  });

  it("renderiza email placeholder quando prop está ausente", () => {
    render(<VerifyEmail />);
    expect(screen.getByText("seu@email.com")).toBeInTheDocument();
  });

  it("renderiza botão de reenviar e link de voltar", () => {
    render(<VerifyEmail email="guilherme@test.com" />);
    expect(screen.getByRole("button", { name: /reenviar/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar para login/i })).toBeInTheDocument();
  });

  it("chama resendConfirmationAction e exibe toast de sucesso", async () => {
    mockResend.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();
    render(<VerifyEmail email="guilherme@test.com" />);

    await user.click(screen.getByRole("button", { name: /reenviar/i }));

    await waitFor(() => {
      expect(mockResend).toHaveBeenCalledWith("guilherme@test.com");
      expect(mockToast.success).toHaveBeenCalledWith(
        "Email de confirmação reenviado com sucesso!",
      );
    });
  });

  it("exibe toast de erro quando action retorna falha", async () => {
    mockResend.mockResolvedValueOnce({ success: false, error: "Muitas tentativas" });
    const user = userEvent.setup();
    render(<VerifyEmail email="guilherme@test.com" />);

    await user.click(screen.getByRole("button", { name: /reenviar/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Muitas tentativas");
    });
  });

  it("exibe toast de erro quando email não é fornecido e tenta reenviar", async () => {
    const user = userEvent.setup();
    render(<VerifyEmail />);

    await user.click(screen.getByRole("button", { name: /reenviar/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Email inválido.");
    });
  });
});
