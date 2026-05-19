"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { updateRecurringRuleSchema } from "@/schemas/settings/update-recurring-rule";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type UpdateRecurringRuleResult =
  | { success: true }
  | { success: false; error: string };

export async function updateRecurringRuleAction(
  data: z.infer<typeof updateRecurringRuleSchema>,
): Promise<UpdateRecurringRuleResult> {
  try {
    const user = await requireAuth();

    const parsed = updateRecurringRuleSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }
    const { id, endDate, recurrenceMonths } = parsed.data;

    const rule = await prisma.recurring_rules.findFirst({
      where: { id, user_id: user.id },
      select: { id: true },
    });

    if (!rule) {
      return { success: false, error: "Regra não encontrada" };
    }

    await prisma.recurring_rules.update({
      where: { id, user_id: user.id },
      data: {
        end_date: endDate ? new Date(endDate) : null,
        recurrence_months: recurrenceMonths ?? null,
      },
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error in updateRecurringRuleAction:", error);
    return { success: false, error: "Erro ao atualizar regra recorrente" };
  }
}
