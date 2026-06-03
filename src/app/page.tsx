import { getUserWithRole } from "@/lib/auth/get-user-with-role";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getUserWithRole();

  if (!user) {
    redirect("/auth/sign-in");
  }

  redirect("/dashboard");
}
