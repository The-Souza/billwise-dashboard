import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { ToggleTheme } from "@/components/ui/toggle-theme";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      <div className="absolute top-6 right-6">
        <ToggleTheme />
      </div>
      {children}
    </>
  );
}
