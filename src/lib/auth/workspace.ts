import { prisma } from "@/lib/prisma/client";
import { cookies } from "next/headers";
import { AuthUser } from "./get-user-with-role";
import { requireAuth } from "./guards";

export type WorkspaceContext = {
  user: AuthUser;
  workspaceId: string;
  workspaceRole: "owner" | "member";
};

export async function requireWorkspace(): Promise<WorkspaceContext> {
  const user = await requireAuth();
  const cookieStore = await cookies();
  const cookieWorkspaceId = cookieStore.get("active_workspace_id")?.value;

  if (cookieWorkspaceId) {
    const membership = await prisma.workspace_members.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: cookieWorkspaceId,
          user_id: user.id,
        },
      },
    });

    if (membership) {
      return {
        user,
        workspaceId: membership.workspace_id,
        workspaceRole: membership.role as "owner" | "member",
      };
    }
  }

  // Fallback: personal workspace (always exists — created by handle_new_user trigger)
  const personal = await prisma.workspaces.findFirst({
    where: { owner_id: user.id, is_personal: true },
  });

  if (!personal) {
    throw new Error(`Personal workspace not found for user ${user.id}`);
  }

  return {
    user,
    workspaceId: personal.id,
    workspaceRole: "owner",
  };
}
