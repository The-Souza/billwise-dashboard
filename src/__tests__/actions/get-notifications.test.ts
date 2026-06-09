import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/guards", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/is-redirect-error", () => ({ isRedirectError: vi.fn().mockReturnValue(false) }));
vi.mock("@/lib/prisma/client", () => ({
  prisma: { notifications: { findMany: vi.fn() } },
}));

import { getNotificationsAction } from "@/actions/(user)/notifications/get-notifications";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

const mockAuth = vi.mocked(requireAuth);
const mockFindMany = vi.mocked(prisma.notifications.findMany);

const MOCK_USER = { id: "user-uuid-123", name: "Test", email: "u@test.com", avatarUrl: null };

const NOW = new Date("2024-03-15T10:00:00Z");

const MOCK_NOTIFICATION = {
  id: "notif-1",
  title: "Conta vencida",
  body: "Sua conta venceu",
  type: "due_date",
  account_id: null,
  workspace_invite_id: null,
  read_at: null,
  created_at: NOW,
  workspace_invites: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(MOCK_USER as never);
  mockFindMany.mockResolvedValue([MOCK_NOTIFICATION] as never);
});

describe("getNotificationsAction", () => {
  it("retorna lista de notificações com unreadCount", async () => {
    const result = await getNotificationsAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.unreadCount).toBe(1);
      expect(result.data[0].id).toBe("notif-1");
      expect(result.data[0].readAt).toBeNull();
    }
  });

  it("calcula unreadCount corretamente com mix de lidas e não lidas", async () => {
    mockFindMany.mockResolvedValue([
      { ...MOCK_NOTIFICATION, id: "n1", read_at: null },
      { ...MOCK_NOTIFICATION, id: "n2", read_at: new Date() },
      { ...MOCK_NOTIFICATION, id: "n3", read_at: null },
    ] as never);

    const result = await getNotificationsAction();

    expect(result.success).toBe(true);
    if (result.success) expect(result.unreadCount).toBe(2);
  });

  it("sanitiza body de budget_exceeded removendo UUID ao final", async () => {
    const UUID = "12345678-1234-4000-8000-123456789abc";
    mockFindMany.mockResolvedValue([{
      ...MOCK_NOTIFICATION,
      type: "budget_exceeded",
      body: `Orçamento excedido [${UUID}]`,
    }] as never);

    const result = await getNotificationsAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].body).toBe("Orçamento excedido");
    }
  });

  it("não sanitiza body de outros tipos de notificação", async () => {
    const UUID = "12345678-1234-4000-8000-123456789abc";
    mockFindMany.mockResolvedValue([{
      ...MOCK_NOTIFICATION,
      type: "due_date",
      body: `Conta vencida [${UUID}]`,
    }] as never);

    const result = await getNotificationsAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].body).toBe(`Conta vencida [${UUID}]`);
    }
  });

  it("retorna inviteStatus do workspace_invite quando presente", async () => {
    mockFindMany.mockResolvedValue([{
      ...MOCK_NOTIFICATION,
      type: "workspace_invite",
      workspace_invite_id: "invite-1",
      workspace_invites: { status: "pending" },
    }] as never);

    const result = await getNotificationsAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].inviteStatus).toBe("pending");
    }
  });

  it("retorna lista vazia quando não há notificações", async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await getNotificationsAction();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
      expect(result.unreadCount).toBe(0);
    }
  });

  it("retorna erro quando prisma falha", async () => {
    mockFindMany.mockRejectedValue(new Error("DB error"));

    const result = await getNotificationsAction();

    expect(result.success).toBe(false);
  });
});
