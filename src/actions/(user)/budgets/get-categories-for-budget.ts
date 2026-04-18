"use server";

import { category_type } from "@/generated/prisma/enums";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { monthYearSchema, uuidSchema } from "@/schemas/shared/params";

export type CategoryForBudget = {
  id: string;
  name: string;
  type: category_type;
  icon: string | null;
};

type GetCategoriesForBudgetResult =
  | { success: true; expense: CategoryForBudget[]; income: CategoryForBudget[] }
  | { success: false; error: string };

const paramsSchema = monthYearSchema.extend({
  excludeBudgetId: uuidSchema.optional(),
});

export async function getCategoriesForBudgetAction(
  month: number,
  year: number,
  excludeBudgetId?: string,
): Promise<GetCategoriesForBudgetResult> {
  const parsed = paramsSchema.safeParse({ month, year, excludeBudgetId });
  if (!parsed.success) {
    return { success: false, error: "Parâmetros inválidos" };
  }

  try {
    const user = await requireAuth();

    const existingBudgets = await prisma.budgets.findMany({
      where: {
        user_id: user.id,
        month: parsed.data.month,
        year: parsed.data.year,
        ...(parsed.data.excludeBudgetId
          ? { id: { not: parsed.data.excludeBudgetId } }
          : {}),
      },
      select: { category_id: true },
    });

    const usedCategoryIds = existingBudgets.map((b) => b.category_id);

    const categories = await prisma.categories.findMany({
      where:
        usedCategoryIds.length > 0
          ? { id: { notIn: usedCategoryIds } }
          : undefined,
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
  } catch (error) {
    console.error("Error in getCategoriesForBudgetAction:", error);
    return { success: false, error: "Erro ao buscar categorias" };
  }
}
