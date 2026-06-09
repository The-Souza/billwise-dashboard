import { getWorkspacesAction } from "@/actions/(user)/workspaces/get-workspaces";
import { Header } from "@/components/layout/Header";
import { SidebarRoot } from "@/components/layout/sidebar/SidebarRoot";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireWorkspace } from "@/lib/auth/workspace";
import { cookies } from "next/headers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const [ctx, workspacesResult] = await Promise.all([
    requireWorkspace(),
    getWorkspacesAction(),
  ]);

  const workspaces = workspacesResult.success ? workspacesResult.data : [];

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SidebarRoot
        user={ctx.user}
        workspaces={workspaces}
        currentWorkspaceId={ctx.workspaceId}
      />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <Header />
        <section className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
          {children}
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
