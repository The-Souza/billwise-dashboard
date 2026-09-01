import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  const stable = {
    data: {
      success: true,
      data: {
        dueDaysAhead: 3,
        onRecurringGenerated: true,
        onBudgetExceeded: true,
      },
    },
    isLoading: false,
    refetch: () => {},
  };
  return { ...actual, useQuery: () => stable };
});

vi.mock("@/actions/(user)/settings/get-notification-prefs", () => ({
  getNotificationPrefsAction: vi.fn(),
}));

vi.mock("@/actions/(user)/settings/update-notification-prefs", () => ({
  updateNotificationPrefsAction: vi.fn(),
}));

vi.mock("@/utils/app-toast", () => ({
  appToast: { success: vi.fn(), error: vi.fn() },
}));

import { updateNotificationPrefsAction } from "@/actions/(user)/settings/update-notification-prefs";
import { NotificationPrefsSection } from "@/app/(protected)/(user)//settings/_components/NotificationPrefsSection";
import { appToast } from "@/utils/app-toast";

const mockUpdate = vi.mocked(updateNotificationPrefsAction);
const mockToast = vi.mocked(appToast);

describe("NotificationPrefsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza os switches de preferências", () => {
    render(<NotificationPrefsSection />);
    expect(screen.getAllByRole("switch").length).toBeGreaterThanOrEqual(2);
  });

  it("renderiza o botão de salvar", () => {
    render(<NotificationPrefsSection />);
    expect(screen.getByRole("button", { name: /salvar/i })).toBeInTheDocument();
  });

  it("mantém o botão de salvar desabilitado quando não há alterações", () => {
    render(<NotificationPrefsSection />);
    expect(screen.getByRole("button", { name: /salvar/i })).toBeDisabled();
  });

  it("não mostra o aviso de alterações não salvas quando nada mudou", () => {
    render(<NotificationPrefsSection />);
    expect(
      screen.queryByText("Alterações não salvas"),
    ).not.toBeInTheDocument();
  });

  it("habilita o botão de salvar e mostra o aviso ao alterar uma preferência", async () => {
    const user = userEvent.setup();
    render(<NotificationPrefsSection />);

    await user.click(screen.getAllByRole("switch")[0]);

    expect(screen.getByText("Alterações não salvas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /salvar/i })).toBeEnabled();
  });

  it("chama updateNotificationPrefsAction e exibe toast de sucesso ao salvar", async () => {
    mockUpdate.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();
    render(<NotificationPrefsSection />);

    await user.click(screen.getAllByRole("switch")[0]);
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith(
        "Preferências salvas com sucesso.",
      );
    });
  });

  it("volta a desabilitar o botão e some com o aviso depois de salvar com sucesso", async () => {
    mockUpdate.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();
    render(<NotificationPrefsSection />);

    await user.click(screen.getAllByRole("switch")[0]);
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /salvar/i })).toBeDisabled();
    });
    expect(
      screen.queryByText("Alterações não salvas"),
    ).not.toBeInTheDocument();
  });

  it("exibe toast de erro quando action retorna falha", async () => {
    mockUpdate.mockResolvedValueOnce({
      success: false,
      error: "Erro ao salvar",
    });
    const user = userEvent.setup();
    render(<NotificationPrefsSection />);

    await user.click(screen.getAllByRole("switch")[0]);
    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Erro ao salvar");
    });
  });
});
