import { createServerSupabase } from "@/lib/supabase/server";
import { cache } from "react";

export type UserRole = "admin" | "user";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
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
    .select("role, avatar_url, name")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return null;

  return {
    id: user.id,
    name: profile.name,
    email: user.email!,
    role: profile.role as UserRole,
    avatarUrl: profile.avatar_url,
  };
});
