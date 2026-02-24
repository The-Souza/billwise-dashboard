"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { formSchema } from "@/schemas/auth/sign-up";
import z from "zod";

type Fields = keyof z.infer<typeof formSchema>;

type SignUpResult =
  | { success: true }
  | { success: false; error: string; field?: Fields };

export async function signUpAction(
  data: z.infer<typeof formSchema>,
): Promise<SignUpResult> {
  const parsed = formSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      field: parsed.error.issues[0].path[0] as Fields,
      error: parsed.error.issues[0].message,
    };
  }

  const supabase = await createServerSupabase();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/sign-up/callback`,
      data: {
        name: parsed.data.name,
      },
    },
  });

  if (error) {
    if (error.status === 429) {
      return {
        success: false,
        error: "Muitas tentativas. Aguarde alguns minutos.",
      };
    }

    return { success: false, error: error.message };
  }

  return { success: true };
}
