"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { analyticsFiltersSchema } from "@/schemas/analytics/analytics-filters";

export type AnalyticsSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthCount: number;
  avgMonthlyIncome: number;
  avgMonthlyExpense: number;
};

type Result =
  | { success: true; data: AnalyticsSummary }
  | { success: false; error: string };

export async function getAnalyticsSummaryAction(
  startMonth: number,
  startYear: number,
  endMonth: number,
  endYear: number,
): Promise<Result> {
  const parsed = analyticsFiltersSchema.safeParse({
    startMonth,
    startYear,
    endMonth,
    endYear,
    type: "all",
  });
  if (!parsed.success) return { success: false, error: "Parâmetros inválidos" };

  try {
    const user = await requireAuth();
    const {
      startMonth: sm,
      startYear: sy,
      endMonth: em,
      endYear: ey,
    } = parsed.data;

    const rows = await prisma.$queryRaw<
      { total_income: number; total_expense: number; balance: number }[]
    >`
      SELECT
        COALESCE(SUM(total_income), 0)::float  AS total_income,
        COALESCE(SUM(total_expense), 0)::float AS total_expense,
        COALESCE(SUM(balance), 0)::float       AS balance
      FROM public.income_vs_expense
      WHERE user_id = ${user.id}::uuid
        AND (year * 100 + month) >= (${sy} * 100 + ${sm})
        AND (year * 100 + month) <= (${ey} * 100 + ${em})
    `;

    const row = rows[0] ?? { total_income: 0, total_expense: 0, balance: 0 };

    let monthCount = 0;
    let m = sm;
    let y = sy;
    while (y * 100 + m <= ey * 100 + em) {
      monthCount++;
      if (m === 12) {
        m = 1;
        y++;
      } else {
        m++;
      }
    }

    return {
      success: true,
      data: {
        totalIncome: row.total_income,
        totalExpense: row.total_expense,
        balance: row.balance,
        monthCount,
        avgMonthlyIncome: monthCount > 0 ? row.total_income / monthCount : 0,
        avgMonthlyExpense: monthCount > 0 ? row.total_expense / monthCount : 0,
      },
    };
  } catch (error) {
    console.error("Error in getAnalyticsSummaryAction:", error);
    return { success: false, error: "Erro ao buscar resumo do período" };
  }
}
