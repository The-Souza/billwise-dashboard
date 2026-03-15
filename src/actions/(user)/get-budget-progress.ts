"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export type BudgetProgressItem = {
  id: string;
  category: string;
  spent: number;
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
        budget_amount: number;
        spent_amount: number;
        used_percentage: number;
      }[]
    >`
      SELECT
        category_id,
        category_name,
        budget_amount::float,
        spent_amount::float,
        used_percentage::float
      FROM public.budget_vs_actual
      WHERE user_id = ${user.id}::uuid
        AND month = ${month}
        AND year  = ${year}
      ORDER BY used_percentage DESC
    `;

    const data: BudgetProgressItem[] = rows.map((row) => ({
      id: row.category_id,
      category: row.category_name,
      spent: row.spent_amount,
      limit: row.budget_amount,
      usedPercentage: row.used_percentage,
    }));

    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao buscar orçamentos" };
  }
}
