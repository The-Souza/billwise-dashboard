import { Card } from "@/components/ui/card";
import { createServerSupabase } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VerifyEmail } from "./_components/VerifyEmail";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params?.email;

  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!email) {
    redirect("/auth/sign-up");
  }

  if (user?.email_confirmed_at) {
    redirect("/dashboard");
  }

  return (
    <Card className="w-full max-w-lg border-none bg-transparent shadow-none">
      <VerifyEmail email={email} />
    </Card>
  );
}
