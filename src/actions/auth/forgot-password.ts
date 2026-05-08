"use server";

import { formSchema } from "@/schemas/auth/forgot-password";
import { createServerSupabase } from "@/lib/supabase/server";
import z from "zod";

type Fields = keyof z.infer<typeof formSchema>;

type ForgotPasswordResult =
  | { success: true }
  | { success: false; error: string; field?: Fields };

export async function forgotPasswordAction(
  formData: z.infer<typeof formSchema>,
): Promise<ForgotPasswordResult> {
  const parsed = formSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      field: parsed.error.issues[0].path[0] as Fields,
      error: parsed.error.issues[0].message,
    };
  }

  try {
    const supabase = await createServerSupabase();

    const { error } = await supabase.auth.resetPasswordForEmail(
      parsed.data.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password/callback`,
      },
    );

    if (error) {
      if (error.status === 429) {
        return {
          success: false,
          error: "Muitas tentativas. Aguarde alguns minutos.",
        };
      }

      return { success: false, error: "Erro ao enviar email de recuperação." };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in forgotPasswordAction:", error);
    return { success: false, error: "Erro ao conectar ao servidor. Tente novamente." };
  }
}
