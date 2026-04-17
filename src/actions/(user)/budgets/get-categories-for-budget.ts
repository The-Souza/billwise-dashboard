"use server";

import { category_type } from "@/generated/prisma/enums";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export type CategoryForBudget = {
  id: string;
  name: string;
  type: category_type;
  icon: string | null;
};

type GetCategoriesForBudgetResult =
  | { success: true; expense: CategoryForBudget[]; income: CategoryForBudget[] }
  | { success: false; error: string };

export async function getCategoriesForBudgetAction(
  month: number,
  year: number,
  excludeBudgetId?: string,
): Promise<GetCategoriesForBudgetResult> {
  try {
    const user = await requireAuth();

    // Categorias que já têm budget no mês, exceto o que está sendo editado
    const existingBudgets = await prisma.budgets.findMany({
      where: {
        user_id: user.id,
        month,
        year,
        ...(excludeBudgetId ? { id: { not: excludeBudgetId } } : {}),
      },
      select: { category_id: true },
    });

    const usedCategoryIds = existingBudgets.map((b) => b.category_id);

    const categories = await prisma.categories.findMany({
      where: {
        id: { notIn: usedCategoryIds.length > 0 ? usedCategoryIds : [""] },
      },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    });

    return {
      success: true,
      expense: categories
        .filter((c) => c.type === "expense")
        .map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          icon: c.icon ?? null,
        })),
      income: categories
        .filter((c) => c.type === "income")
        .map((c) => ({
          id: c.id,
          name: c.name,
          type: c.type,
          icon: c.icon ?? null,
        })),
    };
  } catch {
    return { success: false, error: "Erro ao buscar categorias" };
  }
}
