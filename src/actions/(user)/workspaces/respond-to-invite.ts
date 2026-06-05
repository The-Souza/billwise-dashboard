"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { respondToInviteSchema } from "@/schemas/workspaces";
import { z } from "zod";

type Result = { success: true } | { success: false; error: string };

export async function respondToInviteAction(
  data: z.infer<typeof respondToInviteSchema>,
): Promise<Result> {
  const parsed = respondToInviteSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { inviteId, response } = parsed.data;

  try {
    const user = await requireAuth();

    const invite = await prisma.workspace_invites.findUnique({ where: { id: inviteId } });

    if (!invite || invite.invited_user_id !== user.id) {
      return { success: false, error: "Convite não encontrado" };
    }
    if (invite.expires_at < new Date()) {
      return { success: false, error: "Convite expirado" };
    }
    if (invite.status !== "pending") {
      return { success: false, error: "Convite não está mais pendente" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.workspace_invites.update({
        where: { id: inviteId },
        data: { status: response },
      });

      if (response === "accepted") {
        await tx.workspace_members.create({
          data: { workspace_id: invite.workspace_id, user_id: user.id, role: "member" },
        });
      }

      await tx.notifications.updateMany({
        where: { workspace_invite_id: inviteId, user_id: user.id },
        data: { read_at: new Date() },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Error in respondToInviteAction:", error);
    return { success: false, error: "Erro ao responder convite" };
  }
}
