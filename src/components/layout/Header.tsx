"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ToggleTheme } from "@/components/ui/toggle-theme";
import { UserRole } from "@/lib/auth/getUserWithRole";
import { HeaderBreadcrumb } from "./HeaderBreadcrumb";

interface HeaderProps {
  userRole: UserRole;
}

export function Header({ userRole }: HeaderProps) {
  return (
    <header className="flex h-14 px-4 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <HeaderBreadcrumb userRole={userRole} />
      </div>

      <ToggleTheme />
    </header>
  );
}
