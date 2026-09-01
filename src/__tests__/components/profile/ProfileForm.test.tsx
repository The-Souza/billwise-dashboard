import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/actions/(user)/profile/update-account", () => ({
  updateAccountAction: vi.fn(),
}));

vi.mock("@/actions/(user)/profile/update-avatar", () => ({
  updateAvatarAction: vi.fn(),
}));

vi.mock("@/actions/(user)/profile/remove-avatar", () => ({
  removeAvatarAction: vi.fn(),
}));

vi.mock("@/utils/app-toast", () => ({
  appToast: { success: vi.fn(), error: vi.fn() },
}));

import { updateAccountAction } from "@/actions/(user)/profile/update-account";
import { ProfileForm } from "@/app/(protected)/(user)/profile/_components/ProfileForm";
import type { AuthUser } from "@/lib/auth/get-user-with-role";
import { appToast } from "@/utils/app-toast";

const mockUpdate = vi.mocked(updateAccountAction);
const mockToast = vi.mocked(appToast);

const user: AuthUser = {
  id: "user-1",
  name: "Guilherme Souza",
  email: "guilherme@test.com",
  avatarUrl: null,
};

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("usa 'Seu Perfil' como h1 da página e 'Dados Pessoais' como h2 de seção (ordem de heading correta)", () => {
    render(<ProfileForm user={user} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Seu Perfil" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Dados Pessoais" }),
    ).toBeInTheDocument();
  });

  it("renderiza informações do usuário", () => {
    render(<ProfileForm user={user} />);
    expect(screen.getByDisplayValue("Guilherme Souza")).toBeInTheDocument();
    expect(screen.getByDisplayValue("guilherme@test.com")).toBeInTheDocument();
  });

  it("campos estão desabilitados no modo visualização", () => {
    render(<ProfileForm user={user} />);
    expect(screen.getByLabelText("Nome Completo", { exact: false })).toBeDisabled();
    expect(screen.getByLabelText("Email", { exact: false })).toBeDisabled();
  });

  it("exibe botão Editar e habilita campos ao clicar", async () => {
    const userEvent_ = userEvent.setup();
    render(<ProfileForm user={user} />);

    await userEvent_.click(screen.getByRole("button", { name: /editar/i }));

    expect(screen.getByLabelText("Nome Completo", { exact: false })).toBeEnabled();
    expect(screen.getByLabelText("Email", { exact: false })).toBeEnabled();
    expect(screen.getByRole("button", { name: /salvar/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cancelar/i }),
    ).toBeInTheDocument();
  });

  it("volta para modo visualização ao clicar em Cancelar", async () => {
    const userEvent_ = userEvent.setup();
    render(<ProfileForm user={user} />);

    await userEvent_.click(screen.getByRole("button", { name: /editar/i }));
    await userEvent_.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(screen.getByLabelText("Nome Completo", { exact: false })).toBeDisabled();
    expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
  });

  it("desfaz a edição não salva ao clicar em Cancelar (form.reset)", async () => {
    const userEvent_ = userEvent.setup();
    render(<ProfileForm user={user} />);

    await userEvent_.click(screen.getByRole("button", { name: /editar/i }));
    const nameInput = screen.getByLabelText("Nome Completo", {
      exact: false,
    });
    await userEvent_.clear(nameInput);
    await userEvent_.type(nameInput, "Nome Editado Não Salvo");
    expect(nameInput).toHaveValue("Nome Editado Não Salvo");

    await userEvent_.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(screen.getByDisplayValue("Guilherme Souza")).toBeInTheDocument();
  });

  it("chama updateAccountAction e exibe toast de sucesso ao salvar", async () => {
    mockUpdate.mockResolvedValueOnce({ success: true });
    const userEvent_ = userEvent.setup();
    render(<ProfileForm user={user} />);

    await userEvent_.click(screen.getByRole("button", { name: /editar/i }));
    await userEvent_.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith(
        "Dados atualizados com sucesso",
      );
    });
  });

  it("exibe toast de erro quando updateAccountAction retorna falha", async () => {
    mockUpdate.mockResolvedValueOnce({
      success: false,
      error: "Erro ao salvar",
    });
    const userEvent_ = userEvent.setup();
    render(<ProfileForm user={user} />);

    await userEvent_.click(screen.getByRole("button", { name: /editar/i }));
    await userEvent_.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Erro ao salvar");
    });
  });
});
