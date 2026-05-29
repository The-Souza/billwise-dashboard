"use server";

import { verifyTurnstileToken } from "@/lib/turnstile/verify";
import { createServerSupabase } from "@/lib/supabase/server";
import { formSchema } from "@/schemas/auth/sign-in";
import z from "zod";

type SignInResult = { success: true; user?: string } | { success: false; error: string };

export async function signInAction(
  formData: z.infer<typeof formSchema>,
  captchaToken?: string,
): Promise<SignInResult> {
  const parsed = formSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" };
  }

  const captcha = await verifyTurnstileToken(captchaToken);
  if (!captcha.success) {
    return { success: false, error: captcha.error ?? "Verificação de segurança falhou." };
  }

  try {
    const supabase = await createServerSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
      ...parsed.data,
      options: { captchaToken },
    });

    if (error) {
      return { success: false, error: "Email ou senha incorretos" };
    }

    return { success: true, user: data.user.user_metadata?.name };
  } catch (error) {
    console.error("Error in signInAction:", error);
    return { success: false, error: "Erro ao conectar ao servidor. Tente novamente." };
  }
}
