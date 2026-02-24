"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function logoutAction() {
  const supabase = await createServerSupabase();
  const cookieStore = await cookies();

  await supabase.auth.signOut();

  cookieStore.delete("recovery_session");
}
