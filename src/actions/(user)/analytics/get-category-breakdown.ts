"use server";

import { Prisma } from "@/generated/prisma/client";
import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";
import { analyticsFiltersSchema } from "@/schemas/analytics/analytics-filters";

export type CategoryBreakdownItem = {
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  type: "income" | "expense";
  total: number;
  count: number;
  average: number;
  percentage: number;
};

type Result =
  | { success: true; data: CategoryBreakdownItem[] }
  | { success: false; error: string };

export async function getCategoryBreakdownAction(
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
      {
        category_id: string;
        category_name: string;
        category_icon: string | null;
        category_type: string;
        total: number;
        count: number;
      }[]
    >`
      SELECT
        c.id          AS category_id,
        c.name        AS category_name,
        c.icon        AS category_icon,
        c.type        AS category_type,
        SUM(a.amount)::float AS total,
        COUNT(a.id)::int     AS count
      FROM accounts a
      JOIN categories c ON a.category_id = c.id
      WHERE a.workspace_id = ${ctx.workspaceId}::uuid
        AND (a.year * 100 + a.month) >= (${sy} * 100 + ${sm})
        AND (a.year * 100 + a.month) <= (${ey} * 100 + ${em})
        ${typeCondition}
      GROUP BY c.id, c.name, c.icon, c.type
      ORDER BY total DESC
    `;

    const incomeTotal = rows
      .filter((r) => r.category_type === "income")
      .reduce((s, r) => s + r.total, 0);
    const expenseTotal = rows
      .filter((r) => r.category_type === "expense")
      .reduce((s, r) => s + r.total, 0);

    const data: CategoryBreakdownItem[] = rows.map((r) => {
      const typeTotal =
        r.category_type === "income" ? incomeTotal : expenseTotal;
      return {
        categoryId: r.category_id,
        categoryName: r.category_name,
        categoryIcon: r.category_icon,
        type: r.category_type as "income" | "expense",
        total: r.total,
        count: r.count,
        average: r.count > 0 ? r.total / r.count : 0,
        percentage: typeTotal > 0 ? (r.total / typeTotal) * 100 : 0,
      };
    });

    return { success: true, data };
  } catch (error) {
    console.error("Error in getCategoryBreakdownAction:", error);
    return {
      success: false,
      error: "Erro ao buscar distribuição por categoria",
    };
  }
}
