"use client";

import { WorkspaceSummary } from "@/actions/(user)/workspaces/get-workspaces";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { WorkspaceBulkRemoveAlert } from "./WorkspaceBulkRemoveAlert";
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

interface IconActionButtonProps {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function IconActionButton({
  label,
  onClick,
  className,
  disabled,
  children,
}: IconActionButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          className={className}
          disabled={disabled}
          onClick={onClick}
          aria-label={label}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function WorkspaceCard({
  workspace,
  currentUserId,
}: WorkspaceCardProps) {
  const isOwner = workspace.role === "owner";
  const canBulkSelect = isOwner && !workspace.isPersonal;

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
    selectedIds,
    toggleSelect,
    bulkRemoving,
    bulkRemoveOpen,
    setBulkRemoveOpen,
    confirmBulkRemove,
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
                    ? "border-foreground/20 bg-foreground/5 text-foreground"
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
                <IconActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameOpen(true);
                  }}
                  label="Renomear workspace"
                >
                  <PencilIcon className="size-4" />
                </IconActionButton>
                {!workspace.isPersonal && (
                  <IconActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setInviteOpen(true);
                    }}
                    label="Convidar membro"
                  >
                    <UserPlusIcon className="size-4" />
                  </IconActionButton>
                )}
                {!workspace.isPersonal && (
                  <IconActionButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteOpen(true);
                    }}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    label="Deletar workspace"
                  >
                    <Trash2Icon className="size-4" />
                  </IconActionButton>
                )}
              </>
            ) : (
              !workspace.isPersonal && (
                <IconActionButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setLeaveOpen(true);
                  }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  label="Sair do workspace"
                >
                  <LogOutIcon className="size-4" />
                </IconActionButton>
              )
            )}
            <Separator orientation="vertical" className="h-5" />
            <IconActionButton
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              label={expanded ? "Recolher membros" : "Expandir membros"}
            >
              {expanded ? (
                <ChevronUpIcon className="size-4" />
              ) : (
                <ChevronDownIcon className="size-4" />
              )}
            </IconActionButton>
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
            <div className="flex items-center justify-between gap-2 mb-3 min-h-7">
              <div className="flex items-center gap-1.5">
                <UsersIcon className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Membros</span>
              </div>
              {canBulkSelect && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {selectedIds.size}{" "}
                    {selectedIds.size === 1 ? "selecionado" : "selecionados"}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={selectedIds.size === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setBulkRemoveOpen(true);
                    }}
                  >
                    <UserMinusIcon className="size-3.5" />
                    Remover selecionados
                  </Button>
                </div>
              )}
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
                      className={cn(
                        "grid items-center gap-3 border-b border-border/60 min-h-13.5 px-2 py-2 last:border-0",
                        canBulkSelect
                          ? "grid-cols-[1.25rem_2rem_1fr_2rem]"
                          : "grid-cols-[2rem_1fr_2rem]",
                      )}
                    >
                      {canBulkSelect && <Skeleton className="h-4 w-4 rounded" />}
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
                      className={cn(
                        "grid items-center gap-3 border-b min-h-13.5 border-border/60 p-2 transition-colors last:border-0 hover:bg-muted/50",
                        canBulkSelect
                          ? "grid-cols-[1.25rem_2rem_1fr_2rem]"
                          : "grid-cols-[2rem_1fr_2rem]",
                      )}
                    >
                      {canBulkSelect &&
                        (m.userId !== currentUserId ? (
                          <Checkbox
                            checked={selectedIds.has(m.userId)}
                            onCheckedChange={() => toggleSelect(m.userId)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Selecionar ${m.name}`}
                          />
                        ) : (
                          <Checkbox
                            checked={false}
                            disabled
                            onClick={(e) => e.stopPropagation()}
                            aria-label="Você não pode se remover"
                          />
                        ))}
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
                            <span className="text-xs text-foreground shrink-0">
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
                          <IconActionButton
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTransferOpen(true);
                            }}
                            label="Transferir propriedade do workspace"
                          >
                            <ArrowRightLeftIcon className="size-4" />
                          </IconActionButton>
                        ) : isOwner && m.userId !== currentUserId ? (
                          <IconActionButton
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            disabled={removing === m.userId}
                            onClick={(e) => {
                              e.stopPropagation();
                              setRemoveTarget(m);
                            }}
                            label={`Remover ${m.name} do workspace`}
                          >
                            <UserMinusIcon className="size-4" />
                          </IconActionButton>
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
      <WorkspaceBulkRemoveAlert
        open={bulkRemoveOpen}
        targets={(members ?? []).filter((m) => selectedIds.has(m.userId))}
        removing={bulkRemoving}
        onClose={() => setBulkRemoveOpen(false)}
        onConfirm={confirmBulkRemove}
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
        otherMembersCount={Math.max(workspace.memberCount - 1, 0)}
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
