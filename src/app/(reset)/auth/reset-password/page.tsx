import { Card } from "@/components/ui/card";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "./_components/UpdatePasswordForm";

export default async function UpdatePasswordPage() {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <Card className="w-full max-w-md border-none bg-transparent shadow-none">
      <UpdatePasswordForm />
    </Card>
  );
}
