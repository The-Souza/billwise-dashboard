"use server";

import { requireAuth } from "@/lib/auth/guards";
import { isRedirectError } from "@/lib/is-redirect-error";
import { prisma } from "@/lib/prisma/client";
import { workspaceIdSchema } from "@/schemas/workspaces";
import { cookies } from "next/headers";

type Result = { success: true } | { success: false; error: string };

export async function leaveWorkspaceAction(workspaceId: string): Promise<Result> {
  if (!workspaceIdSchema.safeParse(workspaceId).success) {
    return { success: false, error: "Workspace inválido" };
  }

  try {
    const user = await requireAuth();

    const workspace = await prisma.workspaces.findUnique({ where: { id: workspaceId } });

    if (!workspace) {
      return { success: false, error: "Workspace não encontrado" };
    }

    if (workspace.is_personal) {
      return { success: false, error: "Não é possível sair do workspace pessoal" };
    }

    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user.id } },
    });

    if (!membership) {
      return { success: false, error: "Você não é membro deste workspace" };
    }

    if (membership.role === "owner") {
      return { success: false, error: "O owner não pode sair do workspace" };
    }

    await prisma.workspace_members.delete({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user.id } },
    });

    const cookieStore = await cookies();
    if (cookieStore.get("active_workspace_id")?.value === workspaceId) {
      cookieStore.delete("active_workspace_id");
    }

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error in leaveWorkspaceAction:", error);
    return { success: false, error: "Erro ao sair do workspace" };
  }
}
