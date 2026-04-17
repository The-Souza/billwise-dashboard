"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

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
  try {
    const user = await requireAuth();

    const row = await prisma.budgets.findFirst({
      where: { id, user_id: user.id },
      include: {
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
  } catch {
    return { success: false, error: "Erro ao buscar orçamento" };
  }
}
