import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@marsidev/react-turnstile", () => ({ Turnstile: () => null }));
vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: "light" }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

vi.mock("@/actions/auth/forgot-password", () => ({
  forgotPasswordAction: vi.fn(),
}));

vi.mock("@/utils/app-toast", () => ({
  appToast: { success: vi.fn(), error: vi.fn() },
}));

import { ForgotPasswordForm } from "@/app/(auth)/auth/forgot-password/_components/ForgotPasswordForm";
import { forgotPasswordAction } from "@/actions/auth/forgot-password";
import { appToast } from "@/utils/app-toast";

const mockForgotPassword = vi.mocked(forgotPasswordAction);
const mockToast = vi.mocked(appToast);

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza campo de email e botão de envio", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar email/i })).toBeInTheDocument();
  });

  it("renderiza link para voltar ao login", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByRole("link", { name: /voltar para login/i })).toBeInTheDocument();
  });

  it("botão está desabilitado com email vazio", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByRole("button", { name: /enviar email/i })).toBeDisabled();
  });

  it("habilita botão com email válido", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText("Email"), "guilherme@test.com");
    expect(screen.getByRole("button", { name: /enviar email/i })).toBeEnabled();
  });

  it("chama forgotPasswordAction e exibe toast de sucesso", async () => {
    mockForgotPassword.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText("Email"), "guilherme@test.com");
    await user.click(screen.getByRole("button", { name: /enviar email/i }));

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith(
        { email: "guilherme@test.com" },
        undefined,
      );
      expect(mockToast.success).toHaveBeenCalledWith(
        "Email de redefinição de senha enviado. Verifique sua caixa de entrada.",
      );
    });
  });

  it("exibe toast de erro quando forgotPasswordAction retorna falha", async () => {
    mockForgotPassword.mockResolvedValueOnce({ success: false, error: "Email não encontrado" });
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText("Email"), "guilherme@test.com");
    await user.click(screen.getByRole("button", { name: /enviar email/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Email não encontrado");
    });
  });

  it("exibe toast de erro genérico quando action lança exceção", async () => {
    mockForgotPassword.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();
    render(<ForgotPasswordForm />);
    await user.type(screen.getByLabelText("Email"), "guilherme@test.com");
    await user.click(screen.getByRole("button", { name: /enviar email/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Algo deu errado. Tente novamente em instantes.",
      );
    });
  });
});
