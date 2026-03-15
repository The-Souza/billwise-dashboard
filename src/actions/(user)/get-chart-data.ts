"use server";

import { Prisma } from "@/generated/prisma/client";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export type ChartDataPoint = {
  month: string;
  income: number;
  expense: number;
};

type GetChartDataResult =
  | { success: true; data: ChartDataPoint[] }
  | { success: false; error: string };

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export async function getChartDataAction(
  currentMonth: number,
  currentYear: number,
  periods: number,
): Promise<GetChartDataResult> {
  try {
    const user = await requireAuth();

    const monthsToFetch: { month: number; year: number }[] = [];

    for (let i = periods - 1; i >= 0; i--) {
      let m = currentMonth - i;
      let y = currentYear;

      if (m <= 0) {
        m += 12;
        y -= 1;
      }

      monthsToFetch.push({ month: m, year: y });
    }

    const rows = await prisma.$queryRaw<
      {
        month: number;
        year: number;
        total_income: number;
        total_expense: number;
      }[]
    >`
      SELECT
        month,
        year,
        COALESCE(total_income, 0)::float  AS total_income,
        COALESCE(total_expense, 0)::float AS total_expense
      FROM public.income_vs_expense
      WHERE user_id = ${user.id}::uuid
        AND (
          ${Prisma.join(
            monthsToFetch.map(
              (p) => Prisma.sql`(year = ${p.year} AND month = ${p.month})`,
            ),
            " OR ",
          )}
        )
    `;

    const data: ChartDataPoint[] = monthsToFetch.map(({ month, year }) => {
      const row = rows.find((r) => r.month === month && r.year === year);
      return {
        month: MONTH_LABELS[month - 1],
        income: row?.total_income ?? 0,
        expense: row?.total_expense ?? 0,
      };
    });

    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao buscar dados do gráfico" };
  }
}
