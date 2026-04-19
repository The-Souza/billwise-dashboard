"use server";

import { account_status } from "@/generated/prisma/enums";
import { parseDateParts } from "@/helper/parse-date";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { accountFormSchema } from "@/schemas/accounts/account-form";
import { z } from "zod";

type UpdateAccountResult =
  | { success: true }
  | { success: false; error: string };

function calcRecurringEndDate(startDate: Date, months: number): Date {
  const end = new Date(startDate);
  end.setMonth(end.getMonth() + months);
  return end;
}

export async function updateAccountAction(
  id: string,
  data: z.infer<typeof accountFormSchema>,
): Promise<UpdateAccountResult> {
  try {
    const user = await requireAuth();

    const parsed = accountFormSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Dados inválidos" };
    }

    const {
      title,
      amount,
      categoryId,
      dueDate,
      accountDate,
      status,
      description,
      consumption,
      days,
      recurrenceMonths,
      editScope,
    } = parsed.data;

    const account = await prisma.accounts.findFirst({
      where: { id, user_id: user.id },
      include: {
        account_installments: {
          select: { installment_number: true, total_installments: true },
        },
      },
    });

    if (!account) {
      return { success: false, error: "Conta não encontrada" };
    }

    const isRecurring = account.recurring_rule_id !== null;
    const hasInstallments = account.installment_group_id !== null;

    const { year, month, date: accountDateObj } = parseDateParts(accountDate);

    await prisma.$transaction(
      async (tx) => {
        // -----------------------------
        // RECORRÊNCIA — recurrence_months sempre salvo,
        // título/valor/categoria só no escopo future
        // -----------------------------

        if (isRecurring && account.recurring_rule_id) {
          const endDate =
            recurrenceMonths != null
              ? calcRecurringEndDate(accountDateObj, recurrenceMonths)
              : null;

          await tx.recurring_rules.update({
            where: { id: account.recurring_rule_id },
            data: {
              end_date: endDate,
              recurrence_months: recurrenceMonths ?? null,
              // Propaga título, valor e categoria só se escopo for future
              ...(editScope === "future" && {
                title,
                amount,
                category_id: categoryId ?? undefined,
              }),
            },
          });
        }

        // -----------------------------
        // ESCOPO: all — atualiza todas as contas irmãs
        // -----------------------------

        if (
          editScope === "all" &&
          hasInstallments &&
          account.installment_group_id
        ) {
          const siblings = await tx.accounts.findMany({
            where: {
              installment_group_id: account.installment_group_id,
              user_id: user.id,
            },
            orderBy: { account_date: "asc" },
            select: { id: true },
          });

          const installmentAmount = Number(amount);

          for (let index = 0; index < siblings.length; index++) {
            const sibling = siblings[index];

            // due_date avança o mesmo número de meses que a posição da parcela
            const installmentDueDate = dueDate
              ? (() => {
                  const d = new Date(dueDate);
                  d.setMonth(d.getMonth() + index);
                  return d;
                })()
              : null;

            await tx.accounts.update({
              where: { id: sibling.id },
              data: {
                title,
                amount: installmentAmount,
                category_id: categoryId ?? null,
                due_date: installmentDueDate,
                description: description ?? null,
                consumption: consumption ?? null,
                days: days ?? null,
              },
            });

            await tx.account_installments.updateMany({
              where: { account_id: sibling.id },
              data: {
                amount: installmentAmount,
                ...(installmentDueDate && { due_date: installmentDueDate }),
              },
            });
          }

          return;
        }

        // -----------------------------
        // ESCOPO: single — atualiza só esta conta
        // -----------------------------

        await tx.accounts.update({
          where: { id },
          data: {
            title,
            amount,
            account_date: accountDateObj,
            category_id: categoryId ?? null,
            due_date: dueDate ? new Date(dueDate) : null,
            year,
            month,
            status: status as account_status,
            description: description ?? null,
            consumption: consumption ?? null,
            days: days ?? null,
            paid_at:
              status === "paid" && !account.paid_at
                ? new Date()
                : account.paid_at,
          },
        });
      },
      { timeout: 15000 },
    );

    return { success: true };
  } catch (error) {
    console.error("Error in updateAccountAction:", error);
    return { success: false, error: "Erro ao atualizar conta" };
  }
}
