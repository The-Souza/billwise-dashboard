"use client";

import { AccountDetail } from "@/actions/(user)/accounts/get-account-by-id";
import { CategoryOption } from "@/actions/(user)/accounts/get-categories";
import { formatDateLocal } from "@/helper/format-date-local";
import { accountFormSchema } from "@/schemas/accounts/account-form";
import { appToast } from "@/utils/app-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { AccountFormAlerts } from "./account-form/AccountFormAlerts";
import {
  AccountFormProvider,
  AccountFormValues,
} from "./account-form/AccountFormContext";
import { AccountFormFields } from "./account-form/AccountFormFields";
import { AccountFormFooter } from "./account-form/AccountFormFooter";
import { AccountFormInstallments } from "./account-form/AccountFormInstallments";
import { AccountFormRecurrence } from "./account-form/AccountFormRecurrence";
import { AccountFormSchedule } from "./account-form/AccountFormSchedule";
import { AccountFormScope } from "./account-form/AccountFormScope";
import { AccountFormUtility } from "./account-form/AccountFormUtility";

interface AccountFormProps {
  account?: AccountDetail;
  categories: CategoryOption[];
  onSubmit: (
    data: z.infer<typeof accountFormSchema>,
  ) => Promise<{ success: boolean; error?: string }>;
}

export function AccountForm({
  account,
  categories,
  onSubmit,
}: AccountFormProps) {
  const router = useRouter();
  const isEditing = !!account;

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    mode: "onChange",
    defaultValues: {
      title: account?.title ?? "",
      amount: account?.amount ?? undefined,
      categoryId: account?.categoryId ?? undefined,
      accountDate: account
        ? account.accountDate.slice(0, 10)
        : formatDateLocal(new Date()),
      dueDate: account?.dueDate ? account.dueDate.slice(0, 10) : undefined,
      status: account?.status ?? "pending",
      description: account?.description ?? undefined,
      consumption: account?.consumption ?? undefined,
      days: account?.days ?? undefined,
      scheduleType: account?.isRecurring ? "recurring" : "none",
      recurrenceMonths: account?.recurringMonths ?? null,
      installments: null,
      editScope: "single",
    },
  });

  const selectedCategoryId = useWatch({
    control: form.control,
    name: "categoryId",
  });
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const isUtility = selectedCategory?.isUtility ?? account?.isUtility ?? false;
  const isRecurring = account?.isRecurring ?? false;
  const hasInstallments =
    account?.installmentGroupId !== null &&
    (account?.siblings?.length ?? 0) > 0;

  async function handleSubmit(data: AccountFormValues) {
    const result = await onSubmit(data);

    if (result.success) {
      appToast.success(
        isEditing
          ? "Conta atualizada com sucesso."
          : "Conta criada com sucesso.",
      );
      router.push("/accounts");
    } else {
      appToast.error(result.error ?? "Erro ao salvar conta.");
    }
  }

  return (
    <AccountFormProvider
      value={{
        form,
        account,
        categories,
        isEditing,
        isRecurring,
        hasInstallments,
        isUtility,
        onSubmit,
      }}
    >
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-6 w-full pb-8"
      >
        {isEditing && (hasInstallments || isRecurring) && <AccountFormAlerts />}
        <AccountFormFields />
        {!isEditing && <AccountFormSchedule />}
        {isUtility && <AccountFormUtility />}
        {isEditing && isRecurring && <AccountFormRecurrence />}
        {isEditing && hasInstallments && <AccountFormInstallments />}
        {isEditing && (hasInstallments || isRecurring) && <AccountFormScope />}
        <AccountFormFooter />
      </form>
    </AccountFormProvider>
  );
}
