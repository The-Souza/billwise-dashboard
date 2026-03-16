import { createServerSupabase } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AuthUser, getUserWithRole, UserRole } from "./getUserWithRole";

export async function requireRole(
  allowedRoles: UserRole | UserRole[],
  fallback: string = "/dashboard",
): Promise<AuthUser> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const isRecovery = cookieStore.get("recovery_session");

  if (isRecovery) redirect("/auth/clear-recovery");
  if (error || !data.user) redirect("/auth/sign-in");

  const user = await getUserWithRole();
  if (!user) redirect("/auth/sign-in");

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(user.role)) {
    redirect(fallback);
  }

  return user;
}

export async function requireAuth(): Promise<AuthUser> {
  return requireRole(["admin", "user"], "/auth/sign-in");
}

export async function requireAdmin(): Promise<AuthUser> {
  return requireRole("admin", "/dashboard");
}

export async function requireUser(): Promise<AuthUser> {
  return requireRole("user", "/admin/dashboard");
}

export async function requireGuest() {
  const user = await getUserWithRole();

  if (!user) return;
  if (user.role === "admin") redirect("/admin/dashboard");

  redirect("/dashboard");
}
