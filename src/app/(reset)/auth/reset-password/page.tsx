import { Card } from "@/components/ui/card";
import { createServerSupabase } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { InvalidResetLinkState } from "./_components/InvalidResetLinkState";
import { UpdatePasswordForm } from "./_components/UpdatePasswordForm";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createServerSupabase();
  const cookieStore = await cookies();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isRecovery = cookieStore.get("recovery_session");
  const isInvalid = error === "invalid_reset_link" || !user || !isRecovery;

  return (
    <Card className="w-full max-w-md border-none bg-transparent shadow-none">
      {isInvalid ? <InvalidResetLinkState /> : <UpdatePasswordForm />}
    </Card>
  );
}
