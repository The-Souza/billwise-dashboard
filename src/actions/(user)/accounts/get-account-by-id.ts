"use server";

import { account_status, category_type } from "@/generated/prisma/enums";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export type AccountDetail = {
  id: string;
  title: string;
  amount: number;
  categoryId: string | null;
  categoryType: category_type | null;
  isUtility: boolean;
  dueDate: string | null;
  accountDate: string;
  status: account_status;
  description: string | null;
  consumption: number | null;
  days: number | null;
  month: number;
  year: number;
  isRecurring: boolean;
  recurringMonths: number | null;
  installmentGroupId: string | null;
  installments: {
    id: string;
    number: number;
    total: number;
    dueDate: string;
    amount: number;
    paidAt: string | null;
  }[];
  siblings: {
    id: string;
    number: number;
    month: number;
    year: number;
    amount: number;
    status: account_status;
  }[];
};

type GetAccountByIdResult =
  | { success: true; data: AccountDetail }
  | { success: false; error: string };

export async function getAccountByIdAction(
  id: string,
): Promise<GetAccountByIdResult> {
  try {
    const user = await requireAuth();

    const row = await prisma.accounts.findFirst({
      where: { id, user_id: user.id },
      include: {
        categories: {
          select: { type: true, is_utility: true },
        },
        recurring_rules: {
          select: { end_date: true, recurrence_months: true },
        },
        account_installments: {
          orderBy: { installment_number: "asc" },
        },
      },
    });

    if (!row) {
      return { success: false, error: "Conta não encontrada" };
    }

    const siblings = row.installment_group_id
      ? await prisma.accounts.findMany({
          where: {
            installment_group_id: row.installment_group_id,
            user_id: user.id,
          },
          select: {
            id: true,
            month: true,
            year: true,
            amount: true,
            status: true,
            account_installments: {
              select: { installment_number: true },
            },
          },
          orderBy: { account_date: "asc" },
        })
      : [];

    return {
      success: true,
      data: {
        id: row.id,
        title: row.title,
        amount: Number(row.amount),
        categoryId: row.category_id ?? null,
        categoryType: row.categories?.type ?? null,
        isUtility: row.categories?.is_utility ?? false,
        dueDate: row.due_date?.toISOString() ?? null,
        accountDate: row.account_date.toISOString(),
        status: row.status ?? "pending",
        description: row.description ?? null,
        consumption: row.consumption ? Number(row.consumption) : null,
        days: row.days ?? null,
        month: row.month,
        year: row.year,
        isRecurring: row.recurring_rule_id !== null,
        recurringMonths: row.recurring_rules?.recurrence_months ?? null,
        installmentGroupId: row.installment_group_id ?? null,
        installments: row.account_installments.map((inst) => ({
          id: inst.id,
          number: inst.installment_number,
          total: inst.total_installments,
          dueDate: inst.due_date.toISOString(),
          amount: Number(inst.amount),
          paidAt: inst.paid_at?.toISOString() ?? null,
        })),
        siblings: siblings.map((s) => ({
          id: s.id,
          number: s.account_installments[0]?.installment_number ?? 0,
          month: s.month,
          year: s.year,
          amount: Number(s.amount),
          status: s.status ?? "pending",
        })),
      },
    };
  } catch (error) {
    console.error("Error in getAccountByIdAction:", error);
    return { success: false, error: "Erro ao buscar conta" };
  }
}
