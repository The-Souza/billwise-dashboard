"use server";

import { account_status, category_type } from "@/generated/prisma/enums";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { getAccountsFiltersSchema } from "@/schemas/accounts/get-accounts";
import z from "zod";

export type AccountRow = {
  id: string;
  title: string;
  category: string;
  categoryIcon: string | null;
  categoryType: category_type;
  amount: number;
  dueDate: string | null;
  status: account_status;
  isRecurring: boolean;
  installments: { current: number; total: number } | null;
};

export type AccountFilters = z.input<typeof getAccountsFiltersSchema>;

export type GetAccountsResult =
  | { success: true; data: AccountRow[]; total: number }
  | { success: false; error: string };

export async function getAccountsAction(
  filters: AccountFilters = {},
): Promise<GetAccountsResult> {
  const parsed = getAccountsFiltersSchema.safeParse(filters);
  if (!parsed.success) {
    return { success: false, error: "Filtros inválidos" };
  }

  try {
    const user = await requireAuth();

    const { month, year, status, categoryId, title, page, pageSize } = parsed.data;

    const where = {
      user_id: user.id,
      ...(month !== undefined && { month }),
      ...(year !== undefined && { year }),
      ...(status && { status }),
      ...(categoryId && { category_id: categoryId }),
      ...(title && {
        title: {
          contains: title,
          mode: "insensitive" as const,
        },
      }),
    };

    const [total, rows] = await Promise.all([
      prisma.accounts.count({ where }),
      prisma.accounts.findMany({
        where,
        include: {
          categories: {
            select: {
              name: true,
              type: true,
              icon: true,
            },
          },
          account_installments: {
            select: {
              installment_number: true,
              total_installments: true,
            },
            orderBy: { installment_number: "asc" },
          },
        },
        orderBy: { created_at: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    const data: AccountRow[] = rows.map((row) => {
      const installment = row.account_installments[0] ?? null;

      return {
        id: row.id,
        title: row.title,
        category: row.categories?.name ?? "Sem categoria",
        categoryIcon: row.categories?.icon ?? null,
        categoryType: row.categories?.type ?? "expense",
        amount: Number(row.amount),
        dueDate: row.due_date ? row.due_date.toISOString() : null,
        status: row.status ?? "pending",
        isRecurring: row.recurring_rule_id !== null,
        installments: installment
          ? {
              current: installment.installment_number,
              total: installment.total_installments,
            }
          : null,
      };
    });

    return { success: true, data, total };
  } catch (error) {
    console.error("Error in getAccountsAction:", error);
    return { success: false, error: "Erro ao buscar contas" };
  }
}
