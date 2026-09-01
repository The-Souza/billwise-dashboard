"use server";

import { requireWorkspace } from "@/lib/auth/workspace";
import { isRedirectError } from "@/lib/is-redirect-error";
import { prisma } from "@/lib/prisma/client";
import { monthYearSchema } from "@/schemas/shared/params";

type CopyBudgetsResult =
  | { success: true; copied: number; skipped: number }
  | { success: false; error: string };

function previousMonthYear(month: number, year: number) {
  return month === 1
    ? { month: 12, year: year - 1 }
    : { month: month - 1, year };
}

export async function copyBudgetsFromPreviousMonthAction(
  month: number,
  year: number,
): Promise<CopyBudgetsResult> {
  try {
    const ctx = await requireWorkspace();

    const parsed = monthYearSchema.safeParse({ month, year });
    if (!parsed.success) {
      return { success: false, error: "Parâmetros inválidos" };
    }

    const prev = previousMonthYear(parsed.data.month, parsed.data.year);

    const [previousBudgets, currentBudgets] = await Promise.all([
      prisma.budgets.findMany({
        where: {
          workspace_id: ctx.workspaceId,
          month: prev.month,
          year: prev.year,
        },
        select: { category_id: true, limit_amount: true },
      }),
      prisma.budgets.findMany({
        where: {
          workspace_id: ctx.workspaceId,
          month: parsed.data.month,
          year: parsed.data.year,
        },
        select: { category_id: true },
      }),
    ]);

    if (previousBudgets.length === 0) {
      return {
        success: false,
        error: "Nenhum orçamento encontrado no mês anterior",
      };
    }

    const existingCategoryIds = new Set(
      currentBudgets.map((b) => b.category_id),
    );
    const toCopy = previousBudgets.filter(
      (b) => !existingCategoryIds.has(b.category_id),
    );
    const skipped = previousBudgets.length - toCopy.length;

    if (toCopy.length === 0) {
      return { success: true, copied: 0, skipped };
    }

    await prisma.budgets.createMany({
      data: toCopy.map((b) => ({
        user_id: ctx.user.id,
        workspace_id: ctx.workspaceId,
        category_id: b.category_id,
        limit_amount: b.limit_amount,
        month: parsed.data.month,
        year: parsed.data.year,
      })),
      skipDuplicates: true,
    });

    return { success: true, copied: toCopy.length, skipped };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error in copyBudgetsFromPreviousMonthAction:", error);
    return {
      success: false,
      error: "Erro ao copiar orçamentos do mês anterior",
    };
  }
}