import { SideBarMenu } from "@/components/layout/SideBarMenu";
import { cookies } from "next/headers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireAuth } from "@/lib/auth/guards";
import { Header } from "@/components/layout/Header";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  await requireAuth();

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SideBarMenu variant="inset" />
      <SidebarInset>
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
