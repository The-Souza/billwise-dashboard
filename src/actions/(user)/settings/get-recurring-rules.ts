"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export type RecurringRuleRow = {
  id: string;
  title: string;
  amount: number;
  frequency: string;
  startDate: string;
  endDate: string | null;
  recurrenceMonths: number | null;
  categoryName: string;
  categoryIcon: string | null;
  categoryType: "income" | "expense";
};

export type GetRecurringRulesResult =
  | { success: true; data: RecurringRuleRow[] }
  | { success: false; error: string };

export async function getRecurringRulesAction(): Promise<GetRecurringRulesResult> {
  try {
    const user = await requireAuth();

    const rules = await prisma.recurring_rules.findMany({
      where: {
        user_id: user.id,
        OR: [{ end_date: null }, { end_date: { gte: new Date() } }],
      },
      include: {
        categories: {
          select: { name: true, icon: true, type: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const data: RecurringRuleRow[] = rules.map((rule) => ({
      id: rule.id,
      title: rule.title,
      amount: Number(rule.amount),
      frequency: rule.frequency,
      startDate: rule.start_date.toISOString(),
      endDate: rule.end_date ? rule.end_date.toISOString() : null,
      recurrenceMonths: rule.recurrence_months,
      categoryName: rule.categories.name,
      categoryIcon: rule.categories.icon ?? null,
      categoryType: rule.categories.type,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Error in getRecurringRulesAction:", error);
    return { success: false, error: "Erro ao buscar regras recorrentes" };
  }
}
