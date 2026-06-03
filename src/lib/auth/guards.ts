import { createServerSupabase } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthUser, getUserWithRole } from "./get-user-with-role";

export async function requireAuth(): Promise<AuthUser> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const isRecovery = cookieStore.get("recovery_session");

  if (isRecovery) redirect("/auth/clear-recovery");
  if (error || !data.user) redirect("/auth/sign-in");

  const user = await getUserWithRole();
  if (!user) redirect("/auth/sign-in");

  return user;
}

export async function requireGuest() {
  const user = await getUserWithRole();
  if (!user) return;
  redirect("/dashboard");
}
