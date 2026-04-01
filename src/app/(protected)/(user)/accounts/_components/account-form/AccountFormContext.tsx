"use client";

import { AccountDetail } from "@/actions/(user)/accounts/get-account-by-id";
import { CategoryOption } from "@/actions/(user)/accounts/get-categories";
import { accountFormSchema } from "@/schemas/accounts/account-form";
import { createContext, useContext } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export type AccountFormValues = z.infer<typeof accountFormSchema>;

type AccountFormContextValue = {
  form: UseFormReturn<AccountFormValues>;
  account: AccountDetail | undefined;
  categories: CategoryOption[];
  isEditing: boolean;
  isRecurring: boolean;
  hasInstallments: boolean;
  isUtility: boolean;
  onSubmit: (
    data: AccountFormValues,
  ) => Promise<{ success: boolean; error?: string }>;
};

const AccountFormContext = createContext<AccountFormContextValue | null>(null);

export function AccountFormProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AccountFormContextValue;
}) {
  return (
    <AccountFormContext.Provider value={value}>
      {children}
    </AccountFormContext.Provider>
  );
}

export function useAccountForm() {
  const ctx = useContext(AccountFormContext);
  if (!ctx)
    throw new Error(
      "useAccountForm deve ser usado dentro de AccountFormProvider",
    );
  return ctx;
}
