"use client";

import { createAccountAction } from "@/actions/(user)/accounts/create-account";
import { CategoryOption } from "@/actions/(user)/accounts/get-categories";
import { accountFormSchema } from "@/schemas/accounts/account-form";
import { z } from "zod";
import { AccountForm } from "../_components/AccountForm";

interface AddAccountClientProps {
  categories: CategoryOption[];
}

export function AddAccountClient({ categories }: AddAccountClientProps) {
  async function handleSubmit(data: z.infer<typeof accountFormSchema>) {
    return createAccountAction(data);
  }

  return <AccountForm categories={categories} onSubmit={handleSubmit} />;
}
