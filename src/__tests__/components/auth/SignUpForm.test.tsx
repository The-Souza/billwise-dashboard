import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@marsidev/react-turnstile", () => ({ Turnstile: () => null }));
vi.mock("next-themes", () => ({ useTheme: () => ({ resolvedTheme: "light" }) }));

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mockReplace }) }));

vi.mock("@/actions/auth/sign-up", () => ({
  signUpAction: vi.fn(),
}));

vi.mock("@/utils/app-toast", () => ({
  appToast: { success: vi.fn(), error: vi.fn() },
}));

import { SignUpForm } from "@/app/(auth)/auth/sign-up/_components/SignUpForm";
import { signUpAction } from "@/actions/auth/sign-up";
import { appToast } from "@/utils/app-toast";

const mockSignUp = vi.mocked(signUpAction);
const mockToast = vi.mocked(appToast);

const VALID_DATA = {
  name: "Guilherme Souza",
  email: "guilherme@test.com",
  password: "Senha@123",
  confirmPassword: "Senha@123",
};

async function fillForm(user: ReturnType<typeof userEvent.setup>, data = VALID_DATA) {
  await user.type(screen.getByLabelText("Nome Completo"), data.name);
  await user.type(screen.getByLabelText("Email"), data.email);

  const [passwordInput, confirmInput] = screen.getAllByLabelText(/senha/i).filter(
    (el) => el.tagName === "INPUT",
  );
  await user.type(passwordInput, data.password);
  await user.type(confirmInput, data.confirmPassword);
}

describe("SignUpForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza todos os campos do formulário", () => {
    render(<SignUpForm />);
    expect(screen.getByLabelText("Nome Completo")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /criar conta/i })).toBeInTheDocument();
  });

  it("botão está desabilitado com formulário vazio", () => {
    render(<SignUpForm />);
    expect(screen.getByRole("button", { name: /criar conta/i })).toBeDisabled();
  });

  it("alterna visibilidade da senha", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const [passwordInput] = screen.getAllByLabelText(/^Senha$/i);
    const toggleButtons = screen.getAllByRole("button", { name: /view-password/i });

    expect(passwordInput).toHaveAttribute("type", "password");
    await user.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("habilita botão com dados válidos", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);
    await fillForm(user);
    expect(screen.getByRole("button", { name: /criar conta/i })).toBeEnabled();
  });

  it("chama signUpAction e redireciona para verify-email em sucesso", async () => {
    mockSignUp.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();
    render(<SignUpForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith("Conta criada com sucesso!");
      expect(mockReplace).toHaveBeenCalledWith(
        `/auth/verify-email?email=${encodeURIComponent(VALID_DATA.email)}`,
      );
    });
  });

  it("exibe toast de erro quando signUpAction retorna falha", async () => {
    mockSignUp.mockResolvedValueOnce({ success: false, error: "Email já cadastrado" });
    const user = userEvent.setup();
    render(<SignUpForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /criar conta/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Email já cadastrado");
    });
  });
});
