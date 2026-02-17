import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function PrivateLayput({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) redirect("/auth/sign-in");

  return (
    <main className="flex-1 px-6 py-6 sm:px-10 flex flex-col items-center">
      {children}
    </main>
  );
}
