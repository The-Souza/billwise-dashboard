"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { workspaceIdSchema, userIdSchema } from "@/schemas/workspaces";

type Result = { success: true } | { success: false; error: string };

export async function removeMemberAction(
  workspaceId: string,
  targetUserId: string,
): Promise<Result> {
  if (!workspaceIdSchema.safeParse(workspaceId).success || !userIdSchema.safeParse(targetUserId).success) {
    return { success: false, error: "Parâmetros inválidos" };
  }

  try {
    const user = await requireAuth();

    if (targetUserId === user.id) {
      return { success: false, error: "Não é possível remover a si mesmo" };
    }

    const requesterMembership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user.id } },
    });

    if (!requesterMembership || requesterMembership.role !== "owner") {
      return { success: false, error: "Sem permissão para remover membros" };
    }

    const targetMembership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: targetUserId } },
    });

    if (!targetMembership) {
      return { success: false, error: "Usuário não é membro deste workspace" };
    }

    await prisma.workspace_members.delete({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: targetUserId } },
    });

    return { success: true };
  } catch (error) {
    console.error("Error in removeMemberAction:", error);
    return { success: false, error: "Erro ao remover membro" };
  }
}
