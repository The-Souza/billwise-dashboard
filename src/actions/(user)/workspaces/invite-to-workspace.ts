"use server";

import { requireAuth } from "@/lib/auth/guards";
import { isRedirectError } from "@/lib/is-redirect-error";
import { prisma } from "@/lib/prisma/client";
import { inviteToWorkspaceSchema } from "@/schemas/workspaces";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";

type Result = { success: true } | { success: false; error: string };

export async function inviteToWorkspaceAction(
  data: z.infer<typeof inviteToWorkspaceSchema>,
): Promise<Result> {
  const parsed = inviteToWorkspaceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { workspaceId, email } = parsed.data;

  try {
    const user = await requireAuth();

    const requesterMembership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user.id } },
      include: { workspace: { select: { name: true } } },
    });

    if (!requesterMembership) {
      return { success: false, error: "Workspace não encontrado" };
    }
    if (requesterMembership.role !== "owner") {
      return { success: false, error: "Sem permissão para convidar membros" };
    }

    const rows = await prisma.$queryRaw<{ id: string }[]>(
      Prisma.sql`SELECT id FROM auth.users WHERE email = ${email} LIMIT 1`,
    );
    const invitedUserId = rows[0]?.id;
    if (!invitedUserId) {
      return { success: false, error: "Usuário não encontrado na plataforma" };
    }

    const alreadyMember = await prisma.workspace_members.findUnique({
      where: {
        workspace_id_user_id: { workspace_id: workspaceId, user_id: invitedUserId },
      },
    });
    if (alreadyMember) {
      return { success: false, error: "Usuário já é membro deste workspace" };
    }

    const pendingInvite = await prisma.workspace_invites.findFirst({
      where: { workspace_id: workspaceId, invited_user_id: invitedUserId, status: "pending" },
    });
    if (pendingInvite) {
      return { success: false, error: "Já existe um convite pendente para este usuário" };
    }

    await prisma.$transaction(async (tx) => {
      const invite = await tx.workspace_invites.create({
        data: {
          workspace_id: workspaceId,
          invited_user_id: invitedUserId,
          invited_by: user.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      await tx.notifications.create({
        data: {
          user_id: invitedUserId,
          title: "Convite para workspace",
          body: `${user.name} convidou você para o workspace "${requesterMembership.workspace.name}"`,
          type: "workspace_invite",
          workspace_invite_id: invite.id,
        },
      });
    });

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error in inviteToWorkspaceAction:", error);
    return { success: false, error: "Erro ao enviar convite" };
  }
}
