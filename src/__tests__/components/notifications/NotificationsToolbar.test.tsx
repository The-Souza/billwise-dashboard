import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { NotificationItem } from "@/actions/(user)/notifications/get-notifications";
import { NotificationsProvider } from "@/app/(protected)/(user)/notifications/_components/NotificationsContext";
import { NotificationsToolbar } from "@/app/(protected)/(user)/notifications/_components/NotificationsToolbar";

function makeNotifications(count: number): NotificationItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `notif-${i}`,
    title: `Notificação ${i}`,
    body: null,
    type: "overdue",
    accountId: null,
    workspaceInviteId: null,
    inviteStatus: null,
    readAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  }));
}

function renderWithProvider(notifications: NotificationItem[]) {
  return render(
    <NotificationsProvider initialNotifications={notifications}>
      <NotificationsToolbar />
    </NotificationsProvider>,
  );
}

describe("NotificationsToolbar", () => {
  it("não mostra aviso de limite quando há menos de 50 notificações", () => {
    renderWithProvider(makeNotifications(10));
    expect(
      screen.queryByText(/mostrando as 50 notificações mais recentes/i),
    ).not.toBeInTheDocument();
  });

  it("mostra aviso de limite quando atinge 50 notificações", () => {
    renderWithProvider(makeNotifications(50));
    expect(
      screen.getByText(/mostrando as 50 notificações mais recentes/i),
    ).toBeInTheDocument();
  });
});
