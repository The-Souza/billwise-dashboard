import { createServerSupabase } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const cookieStore = await cookies();

  if (code) {
    const supabase = await createServerSupabase();
    await supabase.auth.exchangeCodeForSession(code);

    cookieStore.set("recovery_session", "true", {
      httpOnly: true,
      path: "/",
    });
  }

  return NextResponse.redirect(new URL("/auth/reset-password", request.url));
}
