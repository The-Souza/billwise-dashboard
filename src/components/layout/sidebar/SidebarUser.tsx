"use client";

import { logoutAction } from "@/actions/auth/logout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { dropdownItems } from "@/config/dropdown-itens";
import { getInitials } from "@/utils/get-initials";
import { ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { User } from "./SidebarRoot";

export function SidebarUser({ user }: User) {
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-md">
                <AvatarImage
                  src={user.avatarUrl ?? undefined}
                  alt={user.email}
                  className="object-cover"
                />

                <AvatarFallback className="bg-primary text-primary-foreground rounded-md">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.name || "Usuário"}
                </span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              {dropdownItems
                .filter((item) => !item.isLogout)
                .map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);

                      router.replace(item.navigation);
                      router.refresh();
                    }}
                  >
                    <item.icon />
                    {item.text}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {dropdownItems
              .filter((item) => item.isLogout)
              .map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  className="text-primary hover:bg-primary/20 focus:bg-primary/20 focus:text-primary"
                  onClick={async () => {
                    await logoutAction();
                    router.replace(item.navigation);
                    router.refresh();
                  }}
                >
                  <item.icon />
                  {item.text}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
