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

    const { categoryId, limitAmount, month, year } = parsed.data;

    const budget = await prisma.budgets.findFirst({
      where: { id, workspace_id: ctx.workspaceId },
      select: { id: true },
    });

    if (!budget) {
      return { success: false, error: "Orçamento não encontrado" };
    }

    const duplicate = await prisma.budgets.findFirst({
      where: {
        workspace_id: ctx.workspaceId,
        category_id: categoryId,
        month,
        year,
        id: { not: id },
      },
      select: { id: true },
    });

    if (duplicate) {
      return {
        success: false,
        error: "Já existe um orçamento para esta categoria neste mês",
      };
    }

    await prisma.budgets.update({
      where: { id },
      data: { category_id: categoryId, limit_amount: limitAmount },
    });

    return { success: true };
  } catch (error) {
    console.error("Error in updateBudgetAction:", error);
    return { success: false, error: "Erro ao atualizar orçamento" };
  }
}
