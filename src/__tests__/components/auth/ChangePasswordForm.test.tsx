import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/actions/(user)/profile/change-password", () => ({
  changePasswordAction: vi.fn(),
}));

vi.mock("@/utils/app-toast", () => ({
  appToast: { success: vi.fn(), error: vi.fn() },
}));

import { changePasswordAction } from "@/actions/(user)/profile/change-password";
import ChangePasswordForm from "@/app/(protected)/(user)/profile/change-password/_components/ChangePasswordForm";
import { appToast } from "@/utils/app-toast";

const mockChangePassword = vi.mocked(changePasswordAction);
const mockToast = vi.mocked(appToast);

const VALID_DATA = {
  currentPassword: "SenhaAtual@1",
  newPassword: "NovaSenha@1",
  confirmNewPassword: "NovaSenha@1",
};

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  data = VALID_DATA,
) {
  await user.type(screen.getByLabelText("Senha Atual"), data.currentPassword);
  await user.type(screen.getByLabelText("Nova Senha"), data.newPassword);
  await user.type(
    screen.getByLabelText("Confirmar Nova Senha"),
    data.confirmNewPassword,
  );
}

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza os três campos de senha e o botão de submit", () => {
    render(<ChangePasswordForm />);
    expect(screen.getByLabelText("Senha Atual")).toBeInTheDocument();
    expect(screen.getByLabelText("Nova Senha")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar Nova Senha")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mudar senha/i }),
    ).toBeInTheDocument();
  });

  it("botão está desabilitado com formulário vazio", () => {
    render(<ChangePasswordForm />);
    expect(screen.getByRole("button", { name: /mudar senha/i })).toBeDisabled();
  });

  it("exibe requisitos da senha", () => {
    render(<ChangePasswordForm />);
    expect(screen.getByText(/no mínimo 6 caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/uma letra maiúscula/i)).toBeInTheDocument();
    expect(screen.getByText(/pelo menos um número/i)).toBeInTheDocument();
    expect(screen.getByText(/um caractere especial/i)).toBeInTheDocument();
  });

  it("toggle de visibilidade funciona independentemente para cada campo", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    const [toggleCurrent, toggleNew, toggleConfirm] = screen.getAllByRole(
      "button",
      {
        name: /view-password/i,
      },
    );

    const currentInput = screen.getByLabelText("Senha Atual");
    const newInput = screen.getByLabelText("Nova Senha");
    const confirmInput = screen.getByLabelText("Confirmar Nova Senha");

    expect(currentInput).toHaveAttribute("type", "password");
    await user.click(toggleCurrent);
    expect(currentInput).toHaveAttribute("type", "text");
    expect(newInput).toHaveAttribute("type", "password");
    expect(confirmInput).toHaveAttribute("type", "password");

    await user.click(toggleNew);
    expect(newInput).toHaveAttribute("type", "text");
    expect(currentInput).toHaveAttribute("type", "password");

    await user.click(toggleConfirm);
    expect(confirmInput).toHaveAttribute("type", "text");
    expect(newInput).toHaveAttribute("type", "password");
  });

  it("habilita botão com todos os campos válidos", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordForm />);
    await fillForm(user);
    expect(screen.getByRole("button", { name: /mudar senha/i })).toBeEnabled();
  });

  it("chama changePasswordAction e exibe toast de sucesso", async () => {
    mockChangePassword.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();
    render(<ChangePasswordForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /mudar senha/i }));

    await waitFor(() => {
      expect(mockChangePassword).toHaveBeenCalledWith(VALID_DATA);
      expect(mockToast.success).toHaveBeenCalledWith(
        "Senha alterada com sucesso!",
      );
    });
  });

  it("exibe toast de erro quando action retorna falha sem campo", async () => {
    mockChangePassword.mockResolvedValueOnce({
      success: false,
      error: "Senha atual incorreta",
    });
    const user = userEvent.setup();
    render(<ChangePasswordForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /mudar senha/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Senha atual incorreta");
    });
  });

  it("limpa campo currentPassword quando action retorna erro nesse campo", async () => {
    mockChangePassword.mockResolvedValueOnce({
      success: false,
      error: "Senha atual incorreta",
      field: "currentPassword" as const,
    });
    const user = userEvent.setup();
    render(<ChangePasswordForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: /mudar senha/i }));

    await waitFor(() => {
      expect(screen.getByLabelText("Senha Atual")).toHaveValue("");
    });
  });
});
