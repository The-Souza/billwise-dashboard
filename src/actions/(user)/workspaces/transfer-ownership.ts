"use server";

import { requireAuth } from "@/lib/auth/guards";
import { isRedirectError } from "@/lib/is-redirect-error";
import { prisma } from "@/lib/prisma/client";
import { transferOwnershipSchema } from "@/schemas/workspaces";
import { z } from "zod";

type Result = { success: true } | { success: false; error: string };

export async function transferOwnershipAction(
  data: z.infer<typeof transferOwnershipSchema>,
): Promise<Result> {
  const parsed = transferOwnershipSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { workspaceId, newOwnerId } = parsed.data;

  try {
    const user = await requireAuth();

    if (newOwnerId === user.id) {
      return {
        success: false,
        error: "Não é possível transferir para si mesmo",
      };
    }

    const requesterMembership = await prisma.workspace_members.findUnique({
      where: {
        workspace_id_user_id: { workspace_id: workspaceId, user_id: user.id },
      },
    });

    if (!requesterMembership || requesterMembership.role !== "owner") {
      return {
        success: false,
        error: "Sem permissão para transferir propriedade",
      };
    }

    const workspace = await prisma.workspaces.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      return { success: false, error: "Workspace não encontrado" };
    }

    if (workspace.is_personal) {
      return {
        success: false,
        error: "Não é possível transferir o workspace pessoal",
      };
    }

    const targetMembership = await prisma.workspace_members.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: newOwnerId,
        },
      },
    });

    if (!targetMembership) {
      return { success: false, error: "Usuário não é membro deste workspace" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.workspaces.update({
        where: { id: workspaceId },
        data: { owner_id: newOwnerId },
      });
      await tx.workspace_members.update({
        where: {
          workspace_id_user_id: { workspace_id: workspaceId, user_id: user.id },
        },
        data: { role: "member" },
      });
      await tx.workspace_members.update({
        where: {
          workspace_id_user_id: {
            workspace_id: workspaceId,
            user_id: newOwnerId,
          },
        },
        data: { role: "owner" },
      });
    });

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error in transferOwnershipAction:", error);
    return { success: false, error: "Erro ao transferir propriedade" };
  }
}
