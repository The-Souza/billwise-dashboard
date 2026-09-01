import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/actions/(user)/notifications/mark-notifications-read", () => ({
  markNotificationsReadAction: vi.fn(),
}));

vi.mock("@/actions/(user)/workspaces/respond-to-invite", () => ({
  respondToInviteAction: vi.fn(),
}));

vi.mock("@/utils/app-toast", () => ({
  appToast: { success: vi.fn(), error: vi.fn() },
}));

import { respondToInviteAction } from "@/actions/(user)/workspaces/respond-to-invite";
import type { NotificationItem } from "@/actions/(user)/notifications/get-notifications";
import { NotificationsClient } from "@/app/(protected)/(user)/notifications/_components/NotificationsClient";
import { NotificationsProvider } from "@/app/(protected)/(user)/notifications/_components/NotificationsContext";
import { NotificationsToolbar } from "@/app/(protected)/(user)/notifications/_components/NotificationsToolbar";

const mockRespond = vi.mocked(respondToInviteAction);

function makeNotification(
  overrides: Partial<NotificationItem> = {},
): NotificationItem {
  return {
    id: "notif-1",
    title: "Conta vencida",
    body: null,
    type: "overdue",
    accountId: null,
    workspaceInviteId: null,
    inviteStatus: null,
    readAt: null,
    createdAt: new Date("2024-01-01").toISOString(),
    ...overrides,
  };
}

function renderWithProvider(notifications: NotificationItem[]) {
  return render(
    <NotificationsProvider initialNotifications={notifications}>
      <NotificationsClient />
    </NotificationsProvider>,
  );
}

describe("NotificationsClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exibe o label do tipo da notificação", () => {
    renderWithProvider([makeNotification({ type: "overdue" })]);
    expect(screen.getByText("Vencida")).toBeInTheDocument();
  });

  it("mostra estado vazio genérico quando não há nenhuma notificação", () => {
    renderWithProvider([]);
    expect(screen.getByText("Nenhuma notificação")).toBeInTheDocument();
    expect(
      screen.getByText("Você está em dia com tudo por aqui."),
    ).toBeInTheDocument();
  });

  it("não diz que o usuário está em dia quando o filtro atual só está vazio (há outras notificações em outro tipo)", async () => {
    const user = userEvent.setup();
    render(
      <NotificationsProvider
        initialNotifications={[
          makeNotification({
            type: "workspace_invite",
            workspaceInviteId: "invite-1",
          }),
        ]}
      >
        <NotificationsToolbar />
        <NotificationsClient />
      </NotificationsProvider>,
    );

    await user.click(screen.getByRole("tab", { name: /vencidas/i }));

    expect(
      screen.getByText("Nenhuma notificação neste filtro"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Você está em dia com tudo por aqui."),
    ).not.toBeInTheDocument();
  });

  it('usa "Marcar como lida" com o componente Button compartilhado (tem foco visível)', () => {
    renderWithProvider([makeNotification()]);
    const button = screen.getByRole("button", { name: /marcar como lida/i });
    expect(button.tagName).toBe("BUTTON");
    expect(button.className).toContain("focus-visible:ring");
  });

  it("chama respondToInviteAction só depois de confirmar a recusa do convite", async () => {
    mockRespond.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();
    renderWithProvider([
      makeNotification({
        type: "workspace_invite",
        workspaceInviteId: "invite-1",
      }),
    ]);

    await user.click(screen.getByRole("button", { name: /recusar convite/i }));
    expect(mockRespond).not.toHaveBeenCalled();

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^recusar$/i }));
    expect(mockRespond).toHaveBeenCalledWith({
      inviteId: "invite-1",
      response: "declined",
    });
  });

  it("não chama respondToInviteAction quando cancela a recusa", async () => {
    const user = userEvent.setup();
    renderWithProvider([
      makeNotification({
        type: "workspace_invite",
        workspaceInviteId: "invite-1",
      }),
    ]);

    await user.click(screen.getByRole("button", { name: /recusar convite/i }));
    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(mockRespond).not.toHaveBeenCalled();
  });
});
