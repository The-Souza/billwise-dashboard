import { cookies } from "next/headers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireAuth } from "@/lib/auth/guards";
import { Header } from "@/components/layout/Header";
import { SidebarRoot } from "@/components/layout/sidebar/SidebarRoot";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const user = await requireAuth();

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SidebarRoot user={user} />
      <SidebarInset>
        <Header />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
