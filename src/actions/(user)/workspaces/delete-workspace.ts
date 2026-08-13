"use server";

import { requireAuth } from "@/lib/auth/guards";
import { isRedirectError } from "@/lib/is-redirect-error";
import { prisma } from "@/lib/prisma/client";
import { workspaceIdSchema } from "@/schemas/workspaces";
import { cookies } from "next/headers";

type Result = { success: true } | { success: false; error: string };

export async function deleteWorkspaceAction(workspaceId: string): Promise<Result> {
  if (!workspaceIdSchema.safeParse(workspaceId).success) {
    return { success: false, error: "Workspace inválido" };
  }

  try {
    const user = await requireAuth();

    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user.id } },
    });

    if (!membership || membership.role !== "owner") {
      return { success: false, error: "Sem permissão para deletar workspace" };
    }

    const workspace = await prisma.workspaces.findUnique({ where: { id: workspaceId } });

    if (!workspace) {
      return { success: false, error: "Workspace não encontrado" };
    }

    if (workspace.is_personal) {
      return { success: false, error: "Não é possível deletar o workspace pessoal" };
    }

    const otherMembers = await prisma.workspace_members.findMany({
      where: { workspace_id: workspaceId, user_id: { not: user.id } },
      select: { user_id: true },
    });

    await prisma.$transaction(async (tx) => {
      if (otherMembers.length > 0) {
        await tx.notifications.createMany({
          data: otherMembers.map((m) => ({
            user_id: m.user_id,
            title: "Workspace removido",
            body: `O workspace "${workspace.name}" foi deletado pelo proprietário e você perdeu o acesso.`,
            type: "workspace_deleted",
          })),
        });
      }

      await tx.workspaces.delete({ where: { id: workspaceId } });
    });

    const cookieStore = await cookies();
    if (cookieStore.get("active_workspace_id")?.value === workspaceId) {
      cookieStore.delete("active_workspace_id");
    }

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error in deleteWorkspaceAction:", error);
    return { success: false, error: "Erro ao deletar workspace" };
  }
}
