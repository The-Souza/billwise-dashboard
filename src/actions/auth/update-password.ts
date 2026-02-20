"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { formSchema } from "@/schemas/auth/update-password";
import z from "zod";

type Fields = keyof z.infer<typeof formSchema>;

type Result =
  | { success: true }
  | { success: false; error: string; field?: Fields };

export async function updatePasswordAction(
  data: z.infer<typeof formSchema>,
): Promise<Result> {
  const parsed = formSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0].message,
    };
  }

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

  return { success: true };
}
