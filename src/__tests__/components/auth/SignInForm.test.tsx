import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

let autoResolveCaptcha = true;
let triggerCaptchaError = false;
vi.mock("@marsidev/react-turnstile", () => ({
  Turnstile: ({
    onSuccess,
    onError,
  }: {
    onSuccess?: (token: string) => void;
    onError?: () => void;
  }) => {
    useEffect(() => {
      if (autoResolveCaptcha) onSuccess?.("test-captcha-token");
      if (triggerCaptchaError) onError?.();
    }, [onSuccess, onError]);
    return null;
  },
}));
vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: "light" }) }));

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

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
    autoResolveCaptcha = true;
    triggerCaptchaError = false;
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

    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(passwordInput).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("mantém o botão desabilitado se o captcha ainda não foi resolvido", async () => {
    autoResolveCaptcha = false;
    const user = userEvent.setup();
    render(<SignInForm />);

    await user.type(screen.getByLabelText("Email"), "guilherme@test.com");
    await user.type(screen.getByLabelText("Senha"), "minhasenha");

    expect(screen.getByRole("button", { name: /faça login/i })).toBeDisabled();
  });

  it("mostra mensagem inline quando a verificação de segurança falha ao carregar", () => {
    autoResolveCaptcha = false;
    triggerCaptchaError = true;
    render(<SignInForm />);

    expect(
      screen.getByText(/não foi possível carregar a verificação de segurança/i),
    ).toBeInTheDocument();
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
        "test-captcha-token",
      );
      expect(mockToast.success).toHaveBeenCalledWith("Bem-vindo, Guilherme!");
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
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
