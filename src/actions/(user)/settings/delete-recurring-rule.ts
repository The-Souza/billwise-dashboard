"use server";

import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";
import { uuidSchema } from "@/schemas/shared/params";
import { revalidatePath } from "next/cache";

type DeleteRecurringRuleResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteRecurringRuleAction(
  id: string,
): Promise<DeleteRecurringRuleResult> {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) return { success: false, error: "ID inválido" };

  try {
    const ctx = await requireWorkspace();

    const rule = await prisma.recurring_rules.findFirst({
      where: { id: parsed.data, workspace_id: ctx.workspaceId },
      select: { id: true },
    });

    if (!rule) {
      return { success: false, error: "Regra não encontrada" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.accounts.deleteMany({
        where: {
          recurring_rule_id: parsed.data,
          workspace_id: ctx.workspaceId,
          status: "pending",
        },
      });

      await tx.recurring_rules.delete({ where: { id: parsed.data } });
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteRecurringRuleAction:", error);
    return { success: false, error: "Erro ao excluir regra recorrente" };
  }
}
