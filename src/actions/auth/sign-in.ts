"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { formSchema } from "@/schemas/auth/sign-in";
import z from "zod";

type SignInResult = { success: true; user?: string } | { success: false; error: string };

export async function signInAction(
  formData: z.infer<typeof formSchema>,
): Promise<SignInResult> {
  const parsed = formSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" };
  }

  try {
    const supabase = await createServerSupabase();

    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return { success: false, error: "Email ou senha incorretos" };
    }

    return { success: true, user: data.user.user_metadata?.name };
  } catch (error) {
    console.error("Error in signInAction:", error);
    return { success: false, error: "Erro ao conectar ao servidor. Tente novamente." };
  }
}
