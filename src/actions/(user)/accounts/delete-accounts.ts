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
      where: { id: { in: ids }, user_id: user.id },
      select: { id: true, recurring_rule_id: true, installment_group_id: true },
    });

    if (accounts.length === 0) {
      return { success: false, error: "Nenhuma conta encontrada" };
    }

    const groupIds = accounts
      .map((a) => a.installment_group_id)
      .filter((g): g is string => g !== null);

    const siblingIds =
      groupIds.length > 0
        ? (
            await prisma.accounts.findMany({
              where: {
                installment_group_id: { in: groupIds },
                user_id: user.id,
              },
              select: { id: true },
            })
          ).map((a) => a.id)
        : [];

    const allIds = [...new Set([...ids, ...siblingIds])];

    const recurringRuleIds = accounts
      .map((a) => a.recurring_rule_id)
      .filter((id): id is string => id !== null);

    await prisma.$transaction(
      async (tx) => {
        await tx.account_installments.deleteMany({
          where: { account_id: { in: allIds } },
        });

        await tx.accounts.deleteMany({
          where: { id: { in: allIds }, user_id: user.id },
        });

        if (recurringRuleIds.length > 0) {
          await tx.recurring_rules.deleteMany({
            where: { id: { in: recurringRuleIds } },
          });
        }
      },
      { timeout: 15000 },
    );

    return { success: true, deleted: allIds.length };
  } catch (error) {
    console.error("Error in deleteAccountsAction:", error);
    return { success: false, error: "Erro ao excluir contas" };
  }
}
