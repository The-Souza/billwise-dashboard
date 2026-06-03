"use server";

import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";
import { budgetFormSchema } from "@/schemas/budgets/budget-form";
import { z } from "zod";

type UpdateBudgetResult = { success: true } | { success: false; error: string };

export async function updateBudgetAction(
  id: string,
  data: z.infer<typeof budgetFormSchema>,
): Promise<UpdateBudgetResult> {
  try {
    const ctx = await requireWorkspace();

    const parsed = budgetFormSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Dados inválidos" };
    }

    const { limitAmount } = parsed.data;

    const budget = await prisma.budgets.findFirst({
      where: { id, workspace_id: ctx.workspaceId },
      select: { id: true },
    });

    if (!budget) {
      return { success: false, error: "Orçamento não encontrado" };
    }

    await prisma.budgets.update({
      where: { id },
      data: { limit_amount: limitAmount },
    });

    return { success: true };
  } catch (error) {
    console.error("Error in updateBudgetAction:", error);
    return { success: false, error: "Erro ao atualizar orçamento" };
  }
}
