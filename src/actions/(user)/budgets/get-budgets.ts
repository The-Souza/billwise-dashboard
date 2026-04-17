"use server";

import { category_type } from "@/generated/prisma/enums";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export type BudgetRow = {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryType: category_type;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  usedPercentage: number;
  year: number;
  month: number;
};

export type GetBudgetsResult =
  | { success: true; data: BudgetRow[] }
  | { success: false; error: string };

export async function getBudgetsAction(
  month: number,
  year: number,
): Promise<GetBudgetsResult> {
  try {
    const user = await requireAuth();

    const rows = await prisma.$queryRaw<
      {
        id: string;
        category_id: string;
        category_name: string;
        category_icon: string | null;
        category_type: category_type;
        budget_amount: number;
        spent_amount: number;
        remaining_amount: number;
        used_percentage: number;
        year: number;
        month: number;
      }[]
    >`
      SELECT
        b.id,
        bva.category_id,
        bva.category_name,
        c.icon AS category_icon,
        c.type AS category_type,
        bva.budget_amount::float,
        bva.spent_amount::float,
        bva.remaining_amount::float,
        bva.used_percentage::float,
        bva.year,
        bva.month
      FROM public.budget_vs_actual bva
      JOIN public.budgets b
        ON b.category_id = bva.category_id
        AND b.year = bva.year
        AND b.month = bva.month
        AND b.user_id = bva.user_id
      JOIN public.categories c ON c.id = bva.category_id
      WHERE bva.user_id = ${user.id}::uuid
        AND bva.month = ${month}
        AND bva.year = ${year}
      ORDER BY c.type ASC, bva.used_percentage DESC
    `;

    return {
      success: true,
      data: rows.map((row) => ({
        id: row.id,
        categoryId: row.category_id,
        categoryName: row.category_name,
        categoryIcon: row.category_icon,
        categoryType: row.category_type,
        budgetAmount: row.budget_amount,
        spentAmount: row.spent_amount,
        remainingAmount: row.remaining_amount,
        usedPercentage: row.used_percentage,
        year: row.year,
        month: row.month,
      })),
    };
  } catch {
    return { success: false, error: "Erro ao buscar orçamentos" };
  }
}
