"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { resendConfirmationSchema } from "@/schemas/auth/verify-email";

type ResendConfirmationResult =
  | { success: true }
  | { success: false; error: string };

export async function resendConfirmation(
  email: string,
): Promise<ResendConfirmationResult> {
  const parsed = resendConfirmationSchema.safeParse(email);
  if (!parsed.success) {
    return { success: false, error: "Email inválido" };
  }

  try {
    const supabase = await createServerSupabase();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: parsed.data,
    });

    if (error) {
      if (error.status === 429) {
        return {
          success: false,
          error: "Muitas tentativas. Aguarde alguns minutos.",
        };
      }
      return { success: false, error: "Erro ao reenviar email de confirmação" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in resendConfirmation:", error);
    return { success: false, error: "Erro ao reenviar email de confirmação" };
  }
}
