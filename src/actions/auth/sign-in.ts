"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { formSchema } from "@/schemas/auth/sign-in";
import z from "zod";

type SignInResult =
  | { success: true }
  | { success: false; error: string };


export async function signInAction(data: z.infer<typeof formSchema>): Promise<SignInResult> {
  const supabase = await createServerSupabase();

  const parsed = formSchema.safeParse({
    email: data.email,
    password: data.password,
  });

  if (!parsed.success) {
    return { success: false, error: "Dados inválidos" };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { success: false, error: "Email ou senha incorretos" };
  }

  return { success: true };
}
