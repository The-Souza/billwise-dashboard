import { Card } from "@/components/ui/card";
import { createServerSupabase } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "./_components/UpdatePasswordForm";

export default async function UpdatePasswordPage() {
  const supabase = await createServerSupabase();
  const cookieStore = await cookies();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isRecovery = cookieStore.get("recovery_session");

  if (!user || !isRecovery) {
    redirect("/auth/sign-in?error=invalid_reset_link");
  }

  return (
    <Card className="w-full max-w-md border-none bg-transparent shadow-none">
      <UpdatePasswordForm />
    </Card>
  );
}
