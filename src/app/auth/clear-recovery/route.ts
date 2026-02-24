import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET() {
  const supabase = await createServerSupabase();

  await supabase.auth.signOut();

  const cookieStore = await cookies();
  cookieStore.delete("recovery_session");

  return NextResponse.redirect(new URL("/auth/sign-in", process.env.NEXT_PUBLIC_SITE_URL));
}
