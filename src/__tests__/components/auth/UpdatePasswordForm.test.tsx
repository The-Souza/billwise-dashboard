import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/actions/auth/update-password", () => ({
  updatePasswordAction: vi.fn(),
}));

vi.mock("@/actions/auth/logout", () => ({
  logoutAction: vi.fn(),
}));

vi.mock("@/utils/app-toast", () => ({
  appToast: { success: vi.fn(), error: vi.fn() },
}));

const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mockReplace }) }));

import { UpdatePasswordForm } from "@/app/(reset)/auth/reset-password/_components/UpdatePasswordForm";
import { updatePasswordAction } from "@/actions/auth/update-password";
import { appToast } from "@/utils/app-toast";

const mockUpdate = vi.mocked(updatePasswordAction);
const mockToast = vi.mocked(appToast);

const VALID_PASSWORD = "NovaSenha@1";

describe("UpdatePasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza campos de senha e botão de submit", () => {
    render(<UpdatePasswordForm />);
    expect(screen.getByLabelText("Senha")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mudar senha/i })).toBeInTheDocument();
  });

  it("botão está desabilitado com formulário vazio", () => {
    render(<UpdatePasswordForm />);
    expect(screen.getByRole("button", { name: /mudar senha/i })).toBeDisabled();
  });

  it("alterna visibilidade dos campos de senha independentemente", async () => {
    const user = userEvent.setup();
    render(<UpdatePasswordForm />);

    const [togglePassword, toggleConfirm] = screen.getAllByRole("button", {
      name: /view-password/i,
    });

    const passwordInput = screen.getByLabelText("Senha");
    const confirmInput = screen.getByLabelText("Confirmar Senha");

    await user.click(togglePassword);
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(confirmInput).toHaveAttribute("type", "password");

    // clicar no segundo toggle muda visibleField para "confirmPassword" — password volta para oculto
    await user.click(toggleConfirm);
    expect(confirmInput).toHaveAttribute("type", "text");
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("chama updatePasswordAction e redireciona em sucesso", async () => {
    mockUpdate.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();
    render(<UpdatePasswordForm />);

    await user.type(screen.getByLabelText("Senha"), VALID_PASSWORD);
    await user.type(screen.getByLabelText("Confirmar Senha"), VALID_PASSWORD);
    await user.click(screen.getByRole("button", { name: /mudar senha/i }));

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith("Senha atualizada com sucesso!");
      expect(mockReplace).toHaveBeenCalledWith("/auth/sign-in");
    });
  });

  it("exibe toast de erro quando action retorna falha", async () => {
    mockUpdate.mockResolvedValueOnce({ success: false, error: "Token inválido" });
    const user = userEvent.setup();
    render(<UpdatePasswordForm />);

    await user.type(screen.getByLabelText("Senha"), VALID_PASSWORD);
    await user.type(screen.getByLabelText("Confirmar Senha"), VALID_PASSWORD);
    await user.click(screen.getByRole("button", { name: /mudar senha/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Token inválido");
    });
  });
});
