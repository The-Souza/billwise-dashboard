"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { importRowSchema } from "@/schemas/accounts/import-row";
import type { ImportRowInput } from "@/schemas/accounts/import-row";
import { normalizeDate, normalizeType } from "@/utils/account-import";

export type ImportAccountsResult =
  | { success: true; created: number }
  | { success: false; error: string };

export async function importAccountsAction(
  rows: ImportRowInput[],
): Promise<ImportAccountsResult> {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { success: false, error: "Nenhuma linha para importar" };
  }

  if (rows.length > 500) {
    return { success: false, error: "Máximo de 500 linhas por importação" };
  }

  try {
    const user = await requireAuth();

    const validRows = rows
      .map((row) => importRowSchema.safeParse(row))
      .filter((r) => r.success)
      .map((r) => r.data);

    if (validRows.length === 0) {
      return { success: false, error: "Nenhuma linha válida encontrada" };
    }

    const allCategories = await prisma.categories.findMany({
      select: { id: true, name: true, type: true },
    });
    const categoryMap = new Map<string, string>();
    for (const cat of allCategories) {
      categoryMap.set(`${cat.name.toLowerCase()}:${cat.type}`, cat.id);
    }

    await prisma.accounts.createMany({
      data: validRows.map((row) => {
        const catType = normalizeType(row.categoryType);
        const categoryId = row.categoryName
          ? (categoryMap.get(`${row.categoryName.toLowerCase()}:${catType}`) ??
            null)
          : null;

        return {
          user_id: user.id,
          title: row.title,
          amount: row.amount,
          month: row.month,
          year: row.year,
          account_date: normalizeDate(row.accountDate)
            ? new Date(normalizeDate(row.accountDate)!)
            : new Date(row.year, row.month - 1, 1),
          category_id: categoryId,
          due_date: normalizeDate(row.dueDate)
            ? new Date(normalizeDate(row.dueDate)!)
            : null,
          paid_at:
            row.status === "paid"
              ? new Date(
                  normalizeDate(row.paidAt) ??
                    `${row.year}-${String(row.month).padStart(2, "0")}-01`,
                )
              : null,
          status: row.status,
          consumption: row.consumption ?? null,
          days: row.days ?? null,
          description: row.description ?? null,
        };
      }),
      skipDuplicates: false,
    });

    return { success: true, created: validRows.length };
  } catch (error) {
    console.error("Error in importAccountsAction:", error);
    return { success: false, error: "Erro ao importar contas" };
  }
}
