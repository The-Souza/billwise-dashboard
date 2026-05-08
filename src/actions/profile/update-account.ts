"use server";

import { requireAuth } from "@/lib/auth/guards";
import { createServerSupabase } from "@/lib/supabase/server";
import { updateAccountSchema } from "@/schemas/profile/update-account";
import { revalidatePath } from "next/cache";
import z from "zod";

type UpdateAccountResponse =
  | { success: true }
  | { success: false; error: string };

export async function updateAccountAction(
  data: z.infer<typeof updateAccountSchema>,
): Promise<UpdateAccountResponse> {
  const parsed = updateAccountSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const user = await requireAuth();
    const supabase = await createServerSupabase();

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ name: parsed.data.name })
      .eq("id", user.id);

    if (profileError) {
      return { success: false, error: "Erro ao atualizar nome." };
    }

    const { error: authError } = await supabase.auth.updateUser({
      email: parsed.data.email,
    });

    if (authError) {
      if (authError.status === 429) {
        return {
          success: false,
          error: "Muitas tentativas. Aguarde alguns minutos.",
        };
      }

      return { success: false, error: "Erro ao atualizar email." };
    }

    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Error in updateAccountAction:", error);
    return { success: false, error: "Erro ao atualizar dados. Tente novamente." };
  }
}
