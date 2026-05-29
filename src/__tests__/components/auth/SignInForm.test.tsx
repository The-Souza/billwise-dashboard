import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@marsidev/react-turnstile", () => ({ Turnstile: () => null }));
vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: "light" }) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

vi.mock("@/actions/auth/sign-in", () => ({
  signInAction: vi.fn(),
}));

vi.mock("@/utils/app-toast", () => ({
  appToast: { success: vi.fn(), error: vi.fn() },
}));

import { SignInForm } from "@/app/(auth)/auth/sign-in/_components/SignInForm";
import { signInAction } from "@/actions/auth/sign-in";
import { appToast } from "@/utils/app-toast";

const mockSignIn = vi.mocked(signInAction);
const mockToast = vi.mocked(appToast);

describe("SignInForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza campos de email, senha e botão de submit", () => {
    render(<SignInForm />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /faça login/i })).toBeInTheDocument();
  });

  it("renderiza link para cadastro e esqueceu senha", () => {
    render(<SignInForm />);
    expect(screen.getByRole("link", { name: /cadastre-se/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /esqueceu a senha/i })).toBeInTheDocument();
  });

  it("botão está desabilitado com formulário vazio", () => {
    render(<SignInForm />);
    expect(screen.getByRole("button", { name: /faça login/i })).toBeDisabled();
  });

  it("alterna visibilidade da senha ao clicar no botão", async () => {
    const user = userEvent.setup();
    render(<SignInForm />);

    const passwordInput = screen.getByLabelText("Senha");
    expect(passwordInput).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: /view-password/i }));
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: /view-password/i }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("chama signInAction com credenciais válidas e exibe toast de sucesso", async () => {
    mockSignIn.mockResolvedValueOnce({ success: true, user: "Guilherme" });
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(screen.getByLabelText("Email"), "guilherme@test.com");
    await user.type(screen.getByLabelText("Senha"), "minhasenha");
    await user.click(screen.getByRole("button", { name: /faça login/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith(
        { email: "guilherme@test.com", password: "minhasenha" },
        undefined,
      );
      expect(mockToast.success).toHaveBeenCalledWith("Bem vindo!, Guilherme");
    });
  });

  it("exibe toast de erro e limpa senha quando signInAction retorna falha", async () => {
    mockSignIn.mockResolvedValueOnce({ success: false, error: "Email ou senha incorretos" });
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(screen.getByLabelText("Email"), "guilherme@test.com");
    await user.type(screen.getByLabelText("Senha"), "senhaerrada");
    await user.click(screen.getByRole("button", { name: /faça login/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Email ou senha incorretos");
    });

    expect(screen.getByLabelText("Senha")).toHaveValue("");
  });

  it("exibe toast de erro genérico quando signInAction lança exceção", async () => {
    mockSignIn.mockRejectedValueOnce(new Error("network error"));
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(screen.getByLabelText("Email"), "guilherme@test.com");
    await user.type(screen.getByLabelText("Senha"), "minhasenha");
    await user.click(screen.getByRole("button", { name: /faça login/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith(
        "Algo deu errado. Tente novamente em instantes.",
      );
    });
  });
});
