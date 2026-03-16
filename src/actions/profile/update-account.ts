"use server";

import { requireAuth } from "@/lib/auth/guards";
import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type UpdateAccountInput = {
  name: string;
  email: string;
};

type UpdateAccountResponse =
  | { success: true }
  | { success: false; error: string };

export async function updateAccountAction(
  data: UpdateAccountInput,
): Promise<UpdateAccountResponse> {
  const user = await requireAuth();
  const supabase = await createServerSupabase();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ name: data.name })
    .eq("id", user.id);

  if (profileError) {
    return {
      success: false,
      error: profileError.message,
    };
  }

  const { error: authError } = await supabase.auth.updateUser({
    email: data.email,
  });

  if (authError) {
    if (authError.status === 429) {
      return {
        success: false,
        error: "Muitas tentativas. Aguarde alguns minutos.",
      };
    }

    return {
      success: false,
      error: authError.message,
    };
  }

  revalidatePath("/profile");

  return { success: true };
}
