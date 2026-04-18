import { redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/auth/get-user-with-role";

export default async function HomePage() {
  const user = await getUserWithRole();

  if (!user) {
    redirect("/auth/sign-in");
  }

  if (user.role === "admin") {
    redirect("/admin/dashboard");
  }

  redirect("/dashboard");
}
