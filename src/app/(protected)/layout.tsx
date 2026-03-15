import { Header } from "@/components/layout/Header";
import { SidebarRoot } from "@/components/layout/sidebar/SidebarRoot";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireAuth } from "@/lib/auth/guards";
import { cookies } from "next/headers";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const user = await requireAuth();

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SidebarRoot user={user} />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <Header userRole={user.role} />
        <section className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
          {children}
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
