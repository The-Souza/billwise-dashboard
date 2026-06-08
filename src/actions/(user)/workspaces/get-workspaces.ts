"use server";

import { requireAuth } from "@/lib/auth/guards";
import { isRedirectError } from "@/lib/is-redirect-error";
import { prisma } from "@/lib/prisma/client";

export type WorkspaceSummary = {
  id: string;
  name: string;
  isPersonal: boolean;
  ownerId: string;
  role: "owner" | "member";
  memberCount: number;
};

type Result =
  | { success: true; data: WorkspaceSummary[] }
  | { success: false; error: string };

export async function getWorkspacesAction(): Promise<Result> {
  try {
    const user = await requireAuth();

    const memberships = await prisma.workspace_members.findMany({
      where: { user_id: user.id },
      include: {
        workspace: { include: { _count: { select: { members: true } } } },
      },
    });

    const data: WorkspaceSummary[] = memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      isPersonal: m.workspace.is_personal,
      ownerId: m.workspace.owner_id,
      role: m.role as "owner" | "member",
      memberCount: m.workspace._count.members,
    }));

    return { success: true, data };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error in getWorkspacesAction:", error);
    return { success: false, error: "Erro ao buscar workspaces" };
  }
}
