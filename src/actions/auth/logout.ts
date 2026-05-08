"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { cookies } from "next/headers";

type LogoutResult = { success: true } | { success: false; error: string };

export async function logoutAction(): Promise<LogoutResult> {
  try {
    const supabase = await createServerSupabase();
    const cookieStore = await cookies();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: "Erro ao encerrar sessão" };
    }

    cookieStore.delete("recovery_session");

    return { success: true };
  } catch (error) {
    console.error("Error in logoutAction:", error);
    return { success: false, error: "Erro ao encerrar sessão" };
  }
}
