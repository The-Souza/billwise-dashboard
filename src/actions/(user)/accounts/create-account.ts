"use server";

import { account_status } from "@/generated/prisma/enums";
import { parseDateParts } from "@/helper/parse-date";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import { accountFormSchema } from "@/schemas/accounts/account-form";
import { randomUUID } from "crypto";
import { z } from "zod";

type CreateAccountResult =
  | { success: true }
  | { success: false; error: string };

function calcRecurringEndDate(startDate: Date, months: number): Date {
  const end = new Date(startDate);
  end.setMonth(end.getMonth() + months);
  return end;
}

export async function createAccountAction(
  data: z.infer<typeof accountFormSchema>,
): Promise<CreateAccountResult> {
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
      scheduleType,
      recurrenceMonths,
      installments,
    } = parsed.data;

    const isRecurring = scheduleType === "recurring";
    const hasInstallments = scheduleType === "installments";
    const installmentsCount = hasInstallments ? (installments ?? null) : null;

    const { year, month, date: accountDateObj } = parseDateParts(accountDate);

    await prisma.$transaction(
      async (tx) => {
        // -----------------------------
        // RECORRÊNCIA
        // -----------------------------

        if (isRecurring) {
          const endDate =
            recurrenceMonths != null
              ? calcRecurringEndDate(accountDateObj, recurrenceMonths)
              : null;

          const recurring = await tx.recurring_rules.create({
            data: {
              user_id: user.id,
              category_id: categoryId!,
              title,
              amount,
              frequency: "monthly",
              start_date: accountDateObj,
              end_date: endDate,
              recurrence_months: recurrenceMonths ?? null,
            },
          });

          await tx.accounts.create({
            data: {
              user_id: user.id,
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
              recurring_rule_id: recurring.id,
              paid_at: status === "paid" ? new Date() : null,
            },
          });

          return;
        }

        // -----------------------------
        // PARCELAMENTO
        // -----------------------------

        if (hasInstallments && installmentsCount && installmentsCount > 1) {
          const installmentAmount = Number(amount) / installmentsCount;
          const groupId = randomUUID();
          const paidAt = status === "paid" ? new Date() : null;

          const accountsData = [];
          const installmentsData = [];

          for (let index = 0; index < installmentsCount; index++) {
            const accountId = randomUUID();
            const installmentDate = new Date(accountDateObj);
            installmentDate.setMonth(installmentDate.getMonth() + index);

            const installmentDueDate = dueDate
              ? (() => {
                  const d = new Date(dueDate);
                  d.setMonth(d.getMonth() + index);
                  return d;
                })()
              : null;

            accountsData.push({
              id: accountId,
              user_id: user.id,
              title,
              amount: installmentAmount,
              account_date: installmentDate,
              category_id: categoryId ?? null,
              due_date: installmentDueDate,
              year: installmentDate.getFullYear(),
              month: installmentDate.getMonth() + 1,
              status: (index === 0 ? status : "pending") as account_status,
              description: description ?? null,
              consumption: consumption ?? null,
              days: days ?? null,
              recurring_rule_id: null,
              paid_at: index === 0 ? paidAt : null,
              installment_group_id: groupId,
            });

            installmentsData.push({
              account_id: accountId,
              installment_number: index + 1,
              total_installments: installmentsCount,
              due_date: installmentDueDate ?? installmentDate,
              amount: installmentAmount,
            });
          }

          await tx.accounts.createMany({ data: accountsData });
          await tx.account_installments.createMany({ data: installmentsData });

          return;
        }

        // -----------------------------
        // CONTA NORMAL
        // -----------------------------

        await tx.accounts.create({
          data: {
            user_id: user.id,
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
            recurring_rule_id: null,
            paid_at: status === "paid" ? new Date() : null,
          },
        });
      },
      { timeout: 15000 },
    );

    return { success: true };
  } catch (error) {
    console.error("Error in createAccountAction:", error);
    return { success: false, error: "Erro ao criar conta" };
  }
}
