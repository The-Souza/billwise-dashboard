"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export type DeleteAccountsResult =
  | { success: true; deleted: number }
  | { success: false; error: string };

export async function deleteAccountsAction(
  ids: string[],
): Promise<DeleteAccountsResult> {
  try {
    if (ids.length === 0) {
      return { success: false, error: "Nenhuma conta selecionada" };
    }

    const user = await requireAuth();

    const accounts = await prisma.accounts.findMany({
      where: {
        id: { in: ids },
        user_id: user.id,
      },
      select: {
        id: true,
        recurring_rule_id: true,
      },
    });

    if (accounts.length === 0) {
      return { success: false, error: "Nenhuma conta encontrada" };
    }

    const recurringRuleIds = accounts
      .map((a) => a.recurring_rule_id)
      .filter((id): id is string => id !== null);

    const accountIds = accounts.map((a) => a.id);

    await prisma.$transaction(async (tx) => {
      await tx.account_installments.deleteMany({
        where: { account_id: { in: accountIds } },
      });

      await tx.accounts.deleteMany({
        where: { id: { in: accountIds } },
      });

      if (recurringRuleIds.length > 0) {
        await tx.recurring_rules.deleteMany({
          where: { id: { in: recurringRuleIds } },
        });
      }
    });

    return { success: true, deleted: accountIds.length };
  } catch {
    return { success: false, error: "Erro ao excluir contas" };
  }
}
