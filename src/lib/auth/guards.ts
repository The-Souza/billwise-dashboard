import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function requireAuth() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const isRecovery = cookieStore.get("recovery_session");

  if (isRecovery) redirect("/auth/clear-recovery");

  if (error || !data.user) redirect("/auth/sign-in");

  return data.user;
}

export async function requireGuest() {
  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getUser();

  if (data.user) redirect("/dashboard");
}
