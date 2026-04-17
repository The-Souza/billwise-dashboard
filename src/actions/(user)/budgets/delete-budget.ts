"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

type DeleteBudgetResult = { success: true } | { success: false; error: string };

export async function deleteBudgetAction(
  id: string,
): Promise<DeleteBudgetResult> {
  try {
    const user = await requireAuth();

    const budget = await prisma.budgets.findFirst({
      where: { id, user_id: user.id },
      select: { id: true },
    });

    if (!budget) {
      return { success: false, error: "Orçamento não encontrado" };
    }

    await prisma.budgets.delete({ where: { id } });

    return { success: true };
  } catch {
    return { success: false, error: "Erro ao excluir orçamento" };
  }
}
