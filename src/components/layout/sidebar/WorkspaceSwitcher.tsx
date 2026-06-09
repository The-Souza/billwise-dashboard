"use client";

import { WorkspaceSummary } from "@/actions/(user)/workspaces/get-workspaces";
import { switchWorkspaceAction } from "@/actions/(user)/workspaces/switch-workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
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
import { WorkspaceCreateDialog } from "@/components/workspaces/WorkspaceCreateDialog";
import { useMounted } from "@/hooks/use-mounted";
import { appToast } from "@/utils/app-toast";
import {
  CheckIcon,
  ChevronsUpDown,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface WorkspaceSwitcherProps {
  workspaces: WorkspaceSummary[];
  currentWorkspaceId: string;
}

export function WorkspaceSwitcher({
  workspaces,
  currentWorkspaceId,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const mounted = useMounted();
  const { resolvedTheme } = useTheme();
  const [createOpen, setCreateOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const { isMobile, setOpenMobile } = useSidebar();

  const current =
    workspaces.find((w) => w.id === currentWorkspaceId) ?? workspaces[0];
  const iconSrc =
    mounted && resolvedTheme === "dark"
      ? "/icon-dark-theme.png"
      : "/icon-light-theme.png";

  async function handleSwitch(workspaceId: string) {
    if (workspaceId === currentWorkspaceId) return;
    setSwitching(true);
    const result = await switchWorkspaceAction({ workspaceId });

    if (!result.success) {
      setSwitching(false);
      appToast.error(result.error);
      return;
    }

    window.location.reload();
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                tooltip={current?.name ?? "Workspace"}
                disabled={switching}
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Image
                  src={iconSrc}
                  width={32}
                  height={32}
                  alt="Billwise Icon"
                  className="rounded-md object-cover"
                  priority
                />
                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-heading font-semibold text-sm first-letter:uppercase">
                    {current?.name ?? "Workspace"}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {current?.role === "owner" ? "Proprietário" : "Membro"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-52 rounded-lg"
              align="start"
              sideOffset={4}
            >
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => {
                    if (isMobile) setOpenMobile(false);
                    handleSwitch(ws.id);
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="flex-1 truncate first-letter:uppercase">
                    {ws.name}
                  </span>
                  {ws.id === currentWorkspaceId && (
                    <CheckIcon className="size-3.5 text-primary shrink-0" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setCreateOpen(true)}
                className="gap-2"
                disabled={workspaces.length >= 3}
              >
                <PlusIcon className="size-4" />
                Criar workspace
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  if (isMobile) setOpenMobile(false);
                  router.push("/workspaces");
                }}
                className="gap-2"
              >
                <SettingsIcon className="size-4" />
                Gerenciar workspaces
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <WorkspaceCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
  );
}
