"use server";

import { account_status, category_type } from "@/generated/prisma/enums";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export type RecentAccount = {
  id: string;
  title: string;
  category: string;
  categoryIcon: string | null;
  categoryType: category_type;
  amount: number;
  dueDate: string | null;
  status: account_status;
};

type GetRecentAccountsResult =
  | { success: true; data: RecentAccount[] }
  | { success: false; error: string };

export async function getRecentAccountsAction(
  month: number,
  year: number,
  limit = 8,
): Promise<GetRecentAccountsResult> {
  try {
    const user = await requireAuth();

    const rows = await prisma.accounts.findMany({
      where: {
        user_id: user.id,
        month,
        year,
      },
      include: {
        categories: {
          select: {
            name: true,
            type: true,
            icon: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: limit,
    });

    const data: RecentAccount[] = rows.map((row) => ({
      id: row.id,
      title: row.title,
      category: row.categories?.name ?? "Sem categoria",
      categoryIcon: row.categories?.icon ?? null,
      categoryType: row.categories?.type ?? "expense",
      amount: Number(row.amount),
      dueDate: row.due_date?.toISOString() ?? null,
      status: row.status ?? "pending",
    }));

    return { success: true, data };
  } catch {
    return { success: false, error: "Erro ao buscar contas recentes" };
  }
}
