"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { formSchema } from "@/schemas/profile/change-password";
import z from "zod";

type Fields = keyof z.infer<typeof formSchema>;

type ChangePasswordResponse =
  | { success: true }
  | { success: false; error: string; field?: Fields };

export async function changePasswordAction(
  formData: z.infer<typeof formSchema>,
): Promise<ChangePasswordResponse> {
  const parsed = formSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  try {
    const supabase = await createServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.currentPassword,
    });

    if (verifyError) {
      return {
        success: false,
        error: "A senha atual está incorreta.",
        field: "currentPassword",
      };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    });

    if (updateError) {
      if (updateError.status === 422) {
        return {
          success: false,
          error: "A nova senha deve ser diferente da senha atual.",
          field: "newPassword",
        };
      }
      return { success: false, error: "Erro ao atualizar senha. Tente novamente." };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in changePasswordAction:", error);
    return { success: false, error: "Erro ao conectar ao servidor. Tente novamente." };
  }
}
