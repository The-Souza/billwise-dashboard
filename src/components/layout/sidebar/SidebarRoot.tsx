"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { AuthUser } from "@/lib/auth/get-user-with-role";
import { BillwiseLogo, SidebarNavigation, SidebarUser } from "./index";

export type User = {
  user: AuthUser;
};

export function SidebarRoot({ user }: User) {
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <BillwiseLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavigation user={user} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
