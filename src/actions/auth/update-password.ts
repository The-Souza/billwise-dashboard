"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { formSchema } from "@/schemas/auth/update-password";
import { cookies } from "next/headers";
import z from "zod";

type Fields = keyof z.infer<typeof formSchema>;

type Result =
  | { success: true }
  | { success: false; error: string; field?: Fields };

export async function updatePasswordAction(
  formData: z.infer<typeof formSchema>,
): Promise<Result> {
  const parsed = formSchema.safeParse(formData);
  const cookieStore = await cookies();

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    };
  }

  try {
    const supabase = await createServerSupabase();

    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      if (error.status === 429) {
        return {
          success: false,
          error: "Muitas tentativas. Aguarde alguns minutos.",
        };
      }

      if (error.status === 422) {
        return {
          success: false,
          error: "A nova senha deve ser diferente da senha atual.",
          field: "password",
        };
      }

      return {
        success: false,
        error: "Erro ao atualizar senha. Tente novamente.",
      };
    }

    await supabase.auth.signOut();
    cookieStore.delete("recovery_session");

    return { success: true };
  } catch (error) {
    console.error("Error in updatePasswordAction:", error);
    return { success: false, error: "Erro ao conectar ao servidor. Tente novamente." };
  }
}
