"use server";

import { requireAuth } from "@/lib/auth/guards";
import { isRedirectError } from "@/lib/is-redirect-error";
import { prisma } from "@/lib/prisma/client";
import { switchWorkspaceSchema } from "@/schemas/workspaces";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type Result = { success: true } | { success: false; error: string };

export async function switchWorkspaceAction(
  data: z.infer<typeof switchWorkspaceSchema>,
): Promise<Result> {
  const parsed = switchWorkspaceSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { workspaceId } = parsed.data;

  try {
    const user = await requireAuth();

    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user.id } },
    });

    if (!membership) {
      return { success: false, error: "Workspace não encontrado" };
    }

    const cookieStore = await cookies();
    cookieStore.set("active_workspace_id", workspaceId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error in switchWorkspaceAction:", error);
    return { success: false, error: "Erro ao trocar workspace" };
  }
}
