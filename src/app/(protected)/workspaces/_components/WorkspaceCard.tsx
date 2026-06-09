"use client";

import { WorkspaceSummary } from "@/actions/(user)/workspaces/get-workspaces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatJoinDate } from "@/utils/format-date";
import { getInitials } from "@/utils/get-initials";
import {
  ArrowRightLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LogOutIcon,
  PencilIcon,
  Trash2Icon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { useWorkspaceCard } from "../_hooks/useWorkspaceCard";
import { WorkspaceDeleteAlert } from "./WorkspaceDeleteAlert";
import { WorkspaceInviteDialog } from "./WorkspaceInviteDialog";
import { WorkspaceLeaveAlert } from "./WorkspaceLeaveAlert";
import { WorkspaceRemoveMemberAlert } from "./WorkspaceRemoveMemberAlert";
import { WorkspaceRenameDialog } from "./WorkspaceRenameDialog";
import { WorkspaceTransferDialog } from "./WorkspaceTransferDialog";

interface WorkspaceCardProps {
  workspace: WorkspaceSummary;
  currentUserId: string;
}

export function WorkspaceCard({
  workspace,
  currentUserId,
}: WorkspaceCardProps) {
  const isOwner = workspace.role === "owner";

  const [inviteOpen, setInviteOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const {
    expanded,
    setExpanded,
    members,
    loadingMembers,
    removing,
    removeTarget,
    setRemoveTarget,
    deleting,
    leaving,
    renameOpen,
    setRenameOpen,
    deleteOpen,
    setDeleteOpen,
    leaveOpen,
    setLeaveOpen,
    confirmRemoveMember,
    handleDelete,
    handleLeave,
  } = useWorkspaceCard(workspace);

  return (
    <>
      <Card
        className={cn("p-4 flex flex-col", !expanded && "cursor-pointer")}
        onClick={() => {
          if (!expanded) setExpanded(true);
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold font-heading text-sm truncate first-letter:uppercase">
                {workspace.name}
              </span>
              {workspace.isPersonal && (
                <span className="text-xs text-muted-foreground shrink-0">
                  (Pessoal)
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                variant="outline"
                className={cn(
                  "text-xs px-1.5 py-2 h-4 font-normal",
                  isOwner
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
                )}
              >
                {isOwner ? "Proprietário" : "Membro"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                · {workspace.memberCount}{" "}
                {workspace.memberCount === 1 ? "membro" : "membros"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isOwner ? (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameOpen(true);
                  }}
                  className="h-7 w-7"
                  aria-label="Renomear workspace"
                >
                  <PencilIcon className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInviteOpen(true);
                  }}
                  className="h-7 w-7"
                  aria-label="Convidar membro"
                >
                  <UserPlusIcon className="size-4" />
                </Button>
                {!workspace.isPersonal && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteOpen(true);
                    }}
                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label="Deletar workspace"
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                )}
              </>
            ) : (
              !workspace.isPersonal && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLeaveOpen(true);
                  }}
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                  aria-label="Sair do workspace"
                >
                  <LogOutIcon className="size-4" />
                </Button>
              )
            )}
            <Separator orientation="vertical" className="h-5" />
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className="h-7 w-7"
              aria-label={expanded ? "Recolher membros" : "Expandir membros"}
            >
              {expanded ? (
                <ChevronUpIcon className="size-4" />
              ) : (
                <ChevronDownIcon className="size-4" />
              )}
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "grid transition-[grid-template-rows,margin-top] duration-300 ease-in-out",
            expanded ? "grid-rows-[1fr] mt-3" : "grid-rows-[0fr] mt-0",
          )}
        >
          <div className="overflow-hidden min-h-0">
            <Separator className="mb-3" />
            <div className="flex items-center gap-1.5 mb-3">
              <UsersIcon className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Membros</span>
            </div>

            <div className="flex flex-col">
              {loadingMembers
                ? Array.from({
                    length:
                      workspace.memberCount > 0
                        ? Math.min(workspace.memberCount, 4)
                        : 2,
                  }).map((_, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[2rem_1fr_2rem] min-h-13.5 items-center gap-3 border-b border-border/60 px-2 py-2 last:border-0"
                    >
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3 w-28 rounded" />
                        <Skeleton className="h-2.5 w-40 rounded" />
                      </div>
                      <span />
                    </div>
                  ))
                : (members ?? []).map((m) => (
                    <div
                      key={m.userId}
                      className="grid grid-cols-[2rem_1fr_2rem] items-center gap-3 border-b min-h-13.5 border-border/60 p-2 transition-colors last:border-0 hover:bg-muted/50"
                    >
                      <Avatar className="h-8 w-8 rounded-md shrink-0">
                        <AvatarImage
                          src={m.avatarUrl ?? undefined}
                          alt={m.name}
                          className="rounded-md object-cover"
                        />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary rounded-md">
                          {getInitials(m.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm font-medium truncate min-w-0">
                            {m.name}
                          </span>
                          {m.role === "owner" && (
                            <span className="text-xs text-amber-600 dark:text-amber-400 shrink-0">
                              · Proprietário(a)
                            </span>
                          )}
                          {m.userId === currentUserId && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              (Você)
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          entrou em {formatJoinDate(m.joinedAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        {isOwner &&
                        m.userId === currentUserId &&
                        !workspace.isPersonal ? (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTransferOpen(true);
                            }}
                            aria-label="Transferir propriedade do workspace"
                          >
                            <ArrowRightLeftIcon className="size-4" />
                          </Button>
                        ) : isOwner && m.userId !== currentUserId ? (
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            disabled={removing === m.userId}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRemoveTarget(m);
                            }}
                            aria-label={`Remover ${m.name} do workspace`}
                          >
                            <UserMinusIcon className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </Card>

      <WorkspaceRenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        workspaceId={workspace.id}
        workspaceName={workspace.name}
      />
      <WorkspaceInviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        workspaceId={workspace.id}
      />
      <WorkspaceRemoveMemberAlert
        target={removeTarget}
        removing={removing}
        onClose={() => setRemoveTarget(null)}
        onConfirm={confirmRemoveMember}
      />
      <WorkspaceDeleteAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        deleting={deleting}
        onConfirm={handleDelete}
      />
      <WorkspaceLeaveAlert
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        leaving={leaving}
        onConfirm={handleLeave}
      />
      <WorkspaceTransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        workspaceId={workspace.id}
        currentUserId={currentUserId}
      />
    </>
  );
}
