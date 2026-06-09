"use client";

import { WorkspaceSummary } from "@/actions/(user)/workspaces/get-workspaces";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { AuthUser } from "@/lib/auth/get-user-with-role";
import { SidebarNavigation, SidebarUser, WorkspaceSwitcher } from "./index";

export type SidebarRootProps = {
  user: AuthUser;
  workspaces: WorkspaceSummary[];
  currentWorkspaceId: string;
};

export function SidebarRoot({
  user,
  workspaces,
  currentWorkspaceId,
}: SidebarRootProps) {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <WorkspaceSwitcher
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspaceId}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavigation />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
