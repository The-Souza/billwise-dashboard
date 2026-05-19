"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { revalidatePath } from "next/cache";

type DeleteRecurringRuleResult =
  | { success: true }
  | { success: false; error: string };

export async function deleteRecurringRuleAction(
  id: string,
): Promise<DeleteRecurringRuleResult> {
  if (!id) return { success: false, error: "ID inválido" };

  try {
    const user = await requireAuth();

    const rule = await prisma.recurring_rules.findFirst({
      where: { id, user_id: user.id },
      select: { id: true },
    });

    if (!rule) {
      return { success: false, error: "Regra não encontrada" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.accounts.deleteMany({
        where: {
          recurring_rule_id: id,
          user_id: user.id,
          status: "pending",
        },
      });

      await tx.recurring_rules.delete({ where: { id } });
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteRecurringRuleAction:", error);
    return { success: false, error: "Erro ao excluir regra recorrente" };
  }
}
