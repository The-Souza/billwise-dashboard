"use client";

import { AccountDetail } from "@/actions/(user)/accounts/get-account-by-id";
import { CategoryOption } from "@/actions/(user)/accounts/get-categories";
import { updateAccountAction } from "@/actions/(user)/accounts/update-account";
import { accountFormSchema } from "@/schemas/accounts/account-form";
import { z } from "zod";
import { AccountForm } from "../_components/AccountForm";

interface EditAccountClientProps {
  id: string;
  account: AccountDetail;
  categories: CategoryOption[];
}

export function EditAccountClient({
  id,
  account,
  categories,
}: EditAccountClientProps) {
  async function handleSubmit(data: z.infer<typeof accountFormSchema>) {
    return updateAccountAction(id, data);
  }

  return (
    <AccountForm
      account={account}
      categories={categories}
      onSubmit={handleSubmit}
    />
  );
}
