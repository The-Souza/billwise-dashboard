import { AuthLayoutWrapper } from "@/components/layout/AuthLayoutWrapper";

export default function ResetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutWrapper>{children}</AuthLayoutWrapper>;
}
