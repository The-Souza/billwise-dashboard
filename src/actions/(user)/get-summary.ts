"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export type MonthlySummary = {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  balanceTrend: number;
  incomeTrend: number;
  expenseTrend: number;
};

type GetSummaryResult =
  | { success: true; data: MonthlySummary }
  | { success: false; error: string };

function calcTrend(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export async function getSummaryAction(
  month: number,
  year: number,
): Promise<GetSummaryResult> {
  try {
    const user = await requireAuth();

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const [current, previous] = await Promise.all([
      prisma.$queryRaw<
        { total_income: number; total_expense: number; balance: number }[]
      >`
        SELECT
          COALESCE(total_income, 0)::float  AS total_income,
          COALESCE(total_expense, 0)::float AS total_expense,
          COALESCE(balance, 0)::float       AS balance
        FROM public.income_vs_expense
        WHERE user_id = ${user.id}::uuid
          AND month = ${month}
          AND year  = ${year}
        LIMIT 1
      `,
      prisma.$queryRaw<
        { total_income: number; total_expense: number; balance: number }[]
      >`
        SELECT
          COALESCE(total_income, 0)::float  AS total_income,
          COALESCE(total_expense, 0)::float AS total_expense,
          COALESCE(balance, 0)::float       AS balance
        FROM public.income_vs_expense
        WHERE user_id = ${user.id}::uuid
          AND month = ${prevMonth}
          AND year  = ${prevYear}
        LIMIT 1
      `,
    ]);

    const cur = current[0] ?? { total_income: 0, total_expense: 0, balance: 0 };
    const prev = previous[0] ?? {
      total_income: 0,
      total_expense: 0,
      balance: 0,
    };

    return {
      success: true,
      data: {
        balance: cur.balance,
        totalIncome: cur.total_income,
        totalExpense: cur.total_expense,
        balanceTrend: calcTrend(cur.balance, prev.balance),
        incomeTrend: calcTrend(cur.total_income, prev.total_income),
        expenseTrend: calcTrend(cur.total_expense, prev.total_expense),
      },
    };
  } catch {
    return { success: false, error: "Erro ao buscar resumo do mês" };
  }
}
