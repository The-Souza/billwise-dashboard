"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { navigation } from "@/config/navigation";
import { User } from "./SidebarRoot";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarNavigation({ user }: User) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        {user.role === "admin" ? "Menu Administrativo" : "Menu"}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navigation[user.role].map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild isActive={pathname === item.url}>
                <Link href={item.url}>
                  <item.icon />
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
