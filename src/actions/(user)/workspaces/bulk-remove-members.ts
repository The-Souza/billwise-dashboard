"use server";

import { requireAuth } from "@/lib/auth/guards";
import { isRedirectError } from "@/lib/is-redirect-error";
import { prisma } from "@/lib/prisma/client";
import { bulkRemoveMembersSchema } from "@/schemas/workspaces";

export type BulkRemoveMembersResult =
  | { success: true; removed: number }
  | { success: false; error: string };

export async function bulkRemoveMembersAction(
  workspaceId: string,
  userIds: string[],
): Promise<BulkRemoveMembersResult> {
  const parsed = bulkRemoveMembersSchema.safeParse({ workspaceId, userIds });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const user = await requireAuth();

    if (parsed.data.userIds.includes(user.id)) {
      return { success: false, error: "Não é possível remover a si mesmo" };
    }

    const requesterMembership = await prisma.workspace_members.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: parsed.data.workspaceId,
          user_id: user.id,
        },
      },
    });

    if (!requesterMembership || requesterMembership.role !== "owner") {
      return { success: false, error: "Sem permissão para remover membros" };
    }

    const result = await prisma.workspace_members.deleteMany({
      where: {
        workspace_id: parsed.data.workspaceId,
        user_id: { in: parsed.data.userIds },
      },
    });

    if (result.count === 0) {
      return { success: false, error: "Nenhum membro encontrado" };
    }

    return { success: true, removed: result.count };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error in bulkRemoveMembersAction:", error);
    return { success: false, error: "Erro ao remover membros" };
  }
}
