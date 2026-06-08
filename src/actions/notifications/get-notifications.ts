"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  accountId: string | null;
  workspaceInviteId: string | null;
  inviteStatus: "pending" | "accepted" | "declined" | null;
  readAt: string | null;
  createdAt: string;
};

export type GetNotificationsResult =
  | { success: true; data: NotificationItem[]; unreadCount: number }
  | { success: false; error: string };

export async function getNotificationsAction(): Promise<GetNotificationsResult> {
  try {
    const user = await requireAuth();

    const notifications = await prisma.notifications.findMany({
      where: { user_id: user.id },
      select: {
        id: true,
        title: true,
        body: true,
        type: true,
        account_id: true,
        workspace_invite_id: true,
        read_at: true,
        created_at: true,
        workspace_invites: { select: { status: true } },
      },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.read_at).length;

    return {
      success: true,
      unreadCount,
      data: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body:
          n.type === "budget_exceeded" && n.body
            ? n.body.replace(/\s*\[[0-9a-f-]{36}\]$/, "")
            : (n.body ?? null),
        type: n.type,
        accountId: n.account_id ?? null,
        workspaceInviteId: n.workspace_invite_id ?? null,
        inviteStatus: n.workspace_invites?.status ?? null,
        readAt: n.read_at?.toISOString() ?? null,
        createdAt: n.created_at!.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return { success: false, error: "Erro ao buscar notificações" };
  }
}
