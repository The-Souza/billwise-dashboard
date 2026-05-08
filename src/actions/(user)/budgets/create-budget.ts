"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { budgetFormSchema } from "@/schemas/budgets/budget-form";
import { z } from "zod";

type CreateBudgetResult = { success: true } | { success: false; error: string };

export async function createBudgetAction(
  data: z.infer<typeof budgetFormSchema>,
): Promise<CreateBudgetResult> {
  try {
    const user = await requireAuth();

    const parsed = budgetFormSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Dados inválidos" };
    }

    const { categoryId, limitAmount, month, year } = parsed.data;

    const existing = await prisma.budgets.findFirst({
      where: { user_id: user.id, category_id: categoryId, month, year },
      select: { id: true },
    });

    if (existing) {
      return {
        success: false,
        error: "Já existe um orçamento para esta categoria neste mês",
      };
    }

    await prisma.budgets.create({
      data: {
        user_id: user.id,
        category_id: categoryId,
        limit_amount: limitAmount,
        month,
        year,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error in createBudgetAction:", error);
    return { success: false, error: "Erro ao criar orçamento" };
  }
}
