"use server";

import { requireAuth } from "@/lib/auth/guards";
import { isRedirectError } from "@/lib/is-redirect-error";
import { prisma } from "@/lib/prisma/client";
import { workspaceIdSchema } from "@/schemas/workspaces";

export type MemberSummary = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: "owner" | "member";
  joinedAt: Date;
};

type Result =
  | { success: true; data: MemberSummary[] }
  | { success: false; error: string };

export async function getWorkspaceMembersAction(workspaceId: string): Promise<Result> {
  const parsed = workspaceIdSchema.safeParse(workspaceId);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const user = await requireAuth();

    const requesterMembership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user.id } },
    });

    if (!requesterMembership) {
      return { success: false, error: "Workspace não encontrado" };
    }

    const members = await prisma.workspace_members.findMany({
      where: { workspace_id: workspaceId },
      include: { user: { select: { id: true, name: true, avatar_url: true } } },
    });

    const data: MemberSummary[] = members.map((m) => ({
      userId: m.user_id,
      name: m.user.name,
      avatarUrl: m.user.avatar_url,
      role: m.role as "owner" | "member",
      joinedAt: m.joined_at,
    }));

    return { success: true, data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error in getWorkspaceMembersAction:", error);
    return { success: false, error: "Erro ao buscar membros" };
  }
}
