"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export type BudgetProgressItem = {
  id: string;
  category: string;
  spent: number;
  icon: string | null;
  limit: number;
  usedPercentage: number;
};

type GetBudgetProgressResult =
  | { success: true; data: BudgetProgressItem[] }
  | { success: false; error: string };

export async function getBudgetProgressAction(
  month: number,
  year: number,
): Promise<GetBudgetProgressResult> {
  try {
    const user = await requireAuth();

    const rows = await prisma.$queryRaw<
      {
        category_id: string;
        category_name: string;
        category_icon: string | null;
        budget_amount: number;
        spent_amount: number;
        used_percentage: number;
      }[]
    >`
      SELECT
        bva.category_id,
        bva.category_name,
        c.icon AS category_icon,
        bva.budget_amount::float,
        bva.spent_amount::float,
        bva.used_percentage::float
      FROM public.budget_vs_actual bva
      JOIN public.categories c ON c.id = bva.category_id
      WHERE bva.user_id = ${user.id}::uuid
        AND bva.month = ${month}
        AND bva.year  = ${year}
      ORDER BY bva.used_percentage DESC
    `;

    const data: BudgetProgressItem[] = rows.map((row) => ({
      id: row.category_id,
      category: row.category_name,
      icon: row.category_icon,
      spent: row.spent_amount,
      limit: row.budget_amount,
      usedPercentage: row.used_percentage,
    }));

    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao buscar orçamentos" };
  }
}
