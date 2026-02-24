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
    <div className="min-h-[60vh] sm:min-h-[65vh] xl:min-h-[80vh] w-full max-w-2xl flex flex-col gap-4 flex-1 items-center justify-center">
      <VerifyEmail email={email} />
    </div>
  );
}
