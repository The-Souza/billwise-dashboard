import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { AuthLayoutWrapper } from "@/components/layout/AuthLayoutWrapper";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return <AuthLayoutWrapper>{children}</AuthLayoutWrapper>;
}
