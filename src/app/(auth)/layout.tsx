import { AuthLayoutWrapper } from "@/components/layout/AuthLayoutWrapper";
import { requireGuest } from "@/lib/auth/guards";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireGuest();

  return <AuthLayoutWrapper>{children}</AuthLayoutWrapper>;
}
