"use server";

import { createServerSupabase } from "@/lib/supabase/server";

type ResendConfirmationResult =
  | { success: true }
  | { success: false; error: string };

export async function resendConfirmation(email: string): Promise<ResendConfirmationResult> {
  const supabase = await createServerSupabase();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
