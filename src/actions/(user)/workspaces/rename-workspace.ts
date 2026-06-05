"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { renameWorkspaceSchema } from "@/schemas/workspaces";
import { z } from "zod";

type Result = { success: true } | { success: false; error: string };

export async function renameWorkspaceAction(
  data: z.infer<typeof renameWorkspaceSchema>,
): Promise<Result> {
  const parsed = renameWorkspaceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { workspaceId, name } = parsed.data;

  try {
    const user = await requireAuth();

    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user.id } },
    });

    if (!membership) {
      return { success: false, error: "Workspace não encontrado" };
    }

    if (membership.role !== "owner") {
      return { success: false, error: "Sem permissão para renomear workspace" };
    }

    await prisma.workspaces.update({
      where: { id: workspaceId },
      data: { name },
    });

    return { success: true };
  } catch (error) {
    console.error("Error in renameWorkspaceAction:", error);
    return { success: false, error: "Erro ao renomear workspace" };
  }
}
