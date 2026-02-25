import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";

export type UserRole = "admin" | "user";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export const getUserWithRole = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createServerSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return null;

  return {
    id: user.id,
    name: user.user_metadata.name,
    email: user.email!,
    role: profile.role as UserRole,
  };
});
