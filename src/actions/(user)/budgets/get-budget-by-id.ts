"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { uuidSchema } from "@/schemas/shared/params";

export type BudgetDetail = {
  id: string;
  categoryId: string;
  categoryName: string;
  limitAmount: number;
  month: number;
  year: number;
};

type GetBudgetByIdResult =
  | { success: true; data: BudgetDetail }
  | { success: false; error: string };

export async function getBudgetByIdAction(
  id: string,
): Promise<GetBudgetByIdResult> {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    return { success: false, error: "ID inválido" };
  }

  try {
    const user = await requireAuth();

    const row = await prisma.budgets.findFirst({
      where: { id, user_id: user.id },
      select: {
        id: true,
        category_id: true,
        limit_amount: true,
        month: true,
        year: true,
        categories: { select: { name: true } },
      },
    });

    if (!row) {
      return { success: false, error: "Orçamento não encontrado" };
    }

    return {
      success: true,
      data: {
        id: row.id,
        categoryId: row.category_id,
        categoryName: row.categories.name,
        limitAmount: Number(row.limit_amount),
        month: row.month,
        year: row.year,
      },
    };
  } catch (error) {
    console.error("Error in getBudgetByIdAction:", error);
    return { success: false, error: "Erro ao buscar orçamento" };
  }
}
