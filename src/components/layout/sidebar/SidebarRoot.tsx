"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { SidebarUser, BillwiseLogo, SidebarNavigation } from "./index";
import { AuthUser } from "@/lib/auth/getUserWithRole";

export type User = {
  user: AuthUser;
};

export function SidebarRoot({ user }: User) {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <BillwiseLogo />
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarNavigation user={user} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
