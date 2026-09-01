"use server";

import { Prisma } from "@/generated/prisma/client";
import { requireWorkspace } from "@/lib/auth/workspace";
import { isRedirectError } from "@/lib/is-redirect-error";
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
  type: "all" | "income" | "expense",
): Promise<Result> {
  const parsed = analyticsFiltersSchema.safeParse({
    startMonth,
    startYear,
    endMonth,
    endYear,
    type,
  });
  if (!parsed.success) return { success: false, error: "Parâmetros inválidos" };

  try {
    const ctx = await requireWorkspace();
    const {
      startMonth: sm,
      startYear: sy,
      endMonth: em,
      endYear: ey,
      type: t,
    } = parsed.data;

    const typeCondition =
      t !== "all" ? Prisma.sql`AND c.type = ${t}` : Prisma.sql``;

    const rows = await prisma.$queryRaw<
      { total_income: number; total_expense: number }[]
    >`
      SELECT
        COALESCE(SUM(CASE WHEN c.type = 'income' THEN a.amount ELSE 0 END), 0)::float  AS total_income,
        COALESCE(SUM(CASE WHEN c.type = 'expense' THEN a.amount ELSE 0 END), 0)::float AS total_expense
      FROM accounts a
      JOIN categories c ON a.category_id = c.id
      WHERE a.workspace_id = ${ctx.workspaceId}::uuid
        AND (a.year * 100 + a.month) >= (${sy} * 100 + ${sm})
        AND (a.year * 100 + a.month) <= (${ey} * 100 + ${em})
        ${typeCondition}
    `;

    const row = rows[0] ?? { total_income: 0, total_expense: 0 };
    const balance = row.total_income - row.total_expense;

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
        balance,
        monthCount,
        avgMonthlyIncome: monthCount > 0 ? row.total_income / monthCount : 0,
        avgMonthlyExpense: monthCount > 0 ? row.total_expense / monthCount : 0,
      },
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error in getAnalyticsSummaryAction:", error);
    return { success: false, error: "Erro ao buscar resumo do período" };
  }
}
