"use server";

import { account_status } from "@/generated/prisma/enums";
import { requireWorkspace } from "@/lib/auth/workspace";
import { isRedirectError } from "@/lib/is-redirect-error";
import { prisma } from "@/lib/prisma/client";
import { updateAccountsStatusSchema } from "@/schemas/accounts/update-accounts-status";

export type UpdateAccountsStatusResult =
  | { success: true; updated: number }
  | { success: false; error: string };

export async function updateAccountsStatusAction(
  ids: string[],
  status: account_status,
): Promise<UpdateAccountsStatusResult> {
  try {
    const ctx = await requireWorkspace();

    const parsed = updateAccountsStatusSchema.safeParse({ ids, status });
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const accounts = await prisma.accounts.findMany({
      where: { id: { in: parsed.data.ids }, workspace_id: ctx.workspaceId },
      select: { id: true, paid_at: true },
    });
    if (accounts.length === 0) {
      return { success: false, error: "Nenhuma conta encontrada" };
    }

    await prisma.$transaction(
      async (tx) => {
        for (const account of accounts) {
          await tx.accounts.update({
            where: { id: account.id },
            data: {
              status: parsed.data.status,
              paid_at:
                parsed.data.status === "paid" && !account.paid_at
                  ? new Date()
                  : account.paid_at,
            },
          });
        }
      },
      { timeout: 15000 },
    );

    return { success: true, updated: accounts.length };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error("Error in updateAccountsStatusAction:", error);
    return { success: false, error: "Erro ao atualizar status das contas" };
  }
}
