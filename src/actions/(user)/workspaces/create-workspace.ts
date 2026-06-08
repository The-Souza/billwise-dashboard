"use server";

import { requireAuth } from "@/lib/auth/guards";
import { isRedirectError } from "@/lib/is-redirect-error";
import { prisma } from "@/lib/prisma/client";
import { createWorkspaceSchema } from "@/schemas/workspaces";
import { z } from "zod";

type Result = { success: true; workspaceId: string } | { success: false; error: string };

export async function createWorkspaceAction(
  data: z.infer<typeof createWorkspaceSchema>,
): Promise<Result> {
  const parsed = createWorkspaceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const user = await requireAuth();

    const count = await prisma.workspace_members.count({
      where: { user_id: user.id },
    });

    if (count >= 3) {
      return { success: false, error: "Limite de 3 workspaces atingido" };
    }

    const workspace = await prisma.$transaction(async (tx) => {
      const ws = await tx.workspaces.create({
        data: { name: parsed.data.name, owner_id: user.id },
      });
      await tx.workspace_members.create({
        data: { workspace_id: ws.id, user_id: user.id, role: "owner" },
      });
      return ws;
    });

    return { success: true, workspaceId: workspace.id };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error in createWorkspaceAction:", error);
    return { success: false, error: "Erro ao criar workspace" };
  }
}
