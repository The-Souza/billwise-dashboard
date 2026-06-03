"use server";

import { Prisma } from "@/generated/prisma/client";
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";
import { analyticsFiltersSchema } from "@/schemas/analytics/analytics-filters";

export type EvolutionDataPoint = {
  month: string;
  income: number;
  expense: number;
};

type Result =
  | { success: true; data: EvolutionDataPoint[] }
  | { success: false; error: string };

const MONTH_LABELS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export async function getAnalyticsEvolutionAction(
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
    const ctx = await requireWorkspace();
    const {
      startMonth: sm,
      startYear: sy,
      endMonth: em,
      endYear: ey,
    } = parsed.data;

    const monthsToFetch: { month: number; year: number }[] = [];
    let m = sm;
    let y = sy;
    while (y * 100 + m <= ey * 100 + em) {
      monthsToFetch.push({ month: m, year: y });
      if (m === 12) {
        m = 1;
        y++;
      } else {
        m++;
      }
    }

    if (monthsToFetch.length === 0) return { success: true, data: [] };

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
      WHERE workspace_id = ${ctx.workspaceId}::uuid
        AND (
          ${Prisma.join(
            monthsToFetch.map(
              (p) => Prisma.sql`(year = ${p.year} AND month = ${p.month})`,
            ),
            " OR ",
          )}
        )
    `;

    const data: EvolutionDataPoint[] = monthsToFetch.map(({ month, year }) => {
      const row = rows.find((r) => r.month === month && r.year === year);
      return {
        month: `${MONTH_LABELS[month - 1]}/${String(year).slice(2)}`,
        income: row?.total_income ?? 0,
        expense: row?.total_expense ?? 0,
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error in getAnalyticsEvolutionAction:", error);
    return { success: false, error: "Erro ao buscar evolução mensal" };
  }
}
