"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export type MarkNotificationsReadResult =
  | { success: true }
  | { success: false; error: string };

export async function markNotificationsReadAction(
  ids?: string[],
): Promise<MarkNotificationsReadResult> {
  try {
    const user = await requireAuth();

    await prisma.notifications.updateMany({
      where: {
        user_id: user.id,
        ...(ids ? { id: { in: ids } } : { read_at: null }),
      },
      data: { read_at: new Date() },
    });

    return { success: true };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return { success: false, error: "Erro ao marcar notificações" };
  }
}
