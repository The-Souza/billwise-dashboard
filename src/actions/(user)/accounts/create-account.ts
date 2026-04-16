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

          for (let index = 0; index < installmentsCount; index++) {
            const installmentDate = new Date(accountDateObj);
            installmentDate.setMonth(installmentDate.getMonth() + index);

            const installmentYear = installmentDate.getFullYear();
            const installmentMonth = installmentDate.getMonth() + 1;

            // due_date avança o mesmo número de meses que a parcela
            const installmentDueDate = dueDate
              ? (() => {
                  const d = new Date(dueDate);
                  d.setMonth(d.getMonth() + index);
                  return d;
                })()
              : null;

            const installmentStatus =
              index === 0 ? (status as account_status) : "pending";

            const account = await tx.accounts.create({
              data: {
                user_id: user.id,
                title,
                amount: installmentAmount,
                account_date: installmentDate,
                category_id: categoryId ?? null,
                due_date: installmentDueDate,
                year: installmentYear,
                month: installmentMonth,
                status: installmentStatus,
                description: description ?? null,
                consumption: consumption ?? null,
                days: days ?? null,
                recurring_rule_id: null,
                paid_at: status === "paid" && index === 0 ? new Date() : null,
                installment_group_id: groupId,
              },
            });

            await tx.account_installments.create({
              data: {
                account_id: account.id,
                installment_number: index + 1,
                total_installments: installmentsCount,
                due_date: installmentDueDate ?? installmentDate,
                amount: installmentAmount,
              },
            });
          }

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
