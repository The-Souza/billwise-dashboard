import { requireAuth } from "@/lib/auth/guards";

export default async function UserLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAuth();

  return <>{children}</>;
}
