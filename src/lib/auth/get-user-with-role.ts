import { createServerSupabase } from "@/lib/supabase/server";
import { cache } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
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
    .select("avatar_url, name")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return null;

  return {
    id: user.id,
    name: profile.name,
    email: user.email!,
    avatarUrl: profile.avatar_url,
  };
});
