import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/actions/profile/update-account", () => ({
  updateAccountAction: vi.fn(),
}));

vi.mock("@/actions/profile/update-avatar", () => ({
  updateAvatarAction: vi.fn(),
}));

vi.mock("@/actions/profile/remove-avatar", () => ({
  removeAvatarAction: vi.fn(),
}));

vi.mock("@/utils/app-toast", () => ({
  appToast: { success: vi.fn(), error: vi.fn() },
}));

import { ProfileForm } from "@/app/(protected)/profile/_components/ProfileForm";
import { updateAccountAction } from "@/actions/profile/update-account";
import { appToast } from "@/utils/app-toast";
import type { AuthUser } from "@/lib/auth/get-user-with-role";

const mockUpdate = vi.mocked(updateAccountAction);
const mockToast = vi.mocked(appToast);

const user: AuthUser = {
  id: "user-1",
  name: "Guilherme Souza",
  email: "guilherme@test.com",
  role: "user",
  avatarUrl: null,
};

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza informações do usuário", () => {
    render(<ProfileForm user={user} />);
    expect(screen.getByDisplayValue("Guilherme Souza")).toBeInTheDocument();
    expect(screen.getByDisplayValue("guilherme@test.com")).toBeInTheDocument();
  });

  it("campos estão desabilitados no modo visualização", () => {
    render(<ProfileForm user={user} />);
    expect(screen.getByLabelText("Nome Completo")).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();
  });

  it("exibe botão Editar e habilita campos ao clicar", async () => {
    const userEvent_ = userEvent.setup();
    render(<ProfileForm user={user} />);

    await userEvent_.click(screen.getByRole("button", { name: /editar/i }));

    expect(screen.getByLabelText("Nome Completo")).toBeEnabled();
    expect(screen.getByLabelText("Email")).toBeEnabled();
    expect(screen.getByRole("button", { name: /salvar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });

  it("volta para modo visualização ao clicar em Cancelar", async () => {
    const userEvent_ = userEvent.setup();
    render(<ProfileForm user={user} />);

    await userEvent_.click(screen.getByRole("button", { name: /editar/i }));
    await userEvent_.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(screen.getByLabelText("Nome Completo")).toBeDisabled();
    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
  });

  it("chama updateAccountAction e exibe toast de sucesso ao salvar", async () => {
    mockUpdate.mockResolvedValueOnce({ success: true });
    const userEvent_ = userEvent.setup();
    render(<ProfileForm user={user} />);

    await userEvent_.click(screen.getByRole("button", { name: /editar/i }));
    await userEvent_.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith("Dados atualizados com sucesso");
    });
  });

  it("exibe toast de erro quando updateAccountAction retorna falha", async () => {
    mockUpdate.mockResolvedValueOnce({ success: false, error: "Erro ao salvar" });
    const userEvent_ = userEvent.setup();
    render(<ProfileForm user={user} />);

    await userEvent_.click(screen.getByRole("button", { name: /editar/i }));
    await userEvent_.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Erro ao salvar");
    });
  });
});
