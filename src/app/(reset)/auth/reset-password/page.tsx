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
    <div className="min-h-[60vh] sm:min-h-[65vh] xl:min-h-[80vh] w-full max-w-md flex flex-col flex-1 items-center justify-center">
      <UpdatePasswordForm />
    </div>
  );
}
