"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { uuidSchema } from "@/schemas/shared/params";

type DeleteBudgetResult = { success: true } | { success: false; error: string };

export async function deleteBudgetAction(
  id: string,
): Promise<DeleteBudgetResult> {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    return { success: false, error: "ID inválido" };
  }

  try {
    const user = await requireAuth();

    const budget = await prisma.budgets.findFirst({
      where: { id: parsed.data, user_id: user.id },
      select: { id: true },
    });

    if (!budget) {
      return { success: false, error: "Orçamento não encontrado" };
    }

    await prisma.budgets.delete({ where: { id: parsed.data } });

    return { success: true };
  } catch (error) {
    console.error("Error in deleteBudgetAction:", error);
    return { success: false, error: "Erro ao excluir orçamento" };
  }
}
