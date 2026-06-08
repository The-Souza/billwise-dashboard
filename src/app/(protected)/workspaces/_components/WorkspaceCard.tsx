"use client";

import { WorkspaceSummary } from "@/actions/(user)/workspaces/get-workspaces";
import { renameWorkspaceAction } from "@/actions/(user)/workspaces/rename-workspace";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { renameWorkspaceSchema } from "@/schemas/workspaces";
import { appToast } from "@/utils/app-toast";
import { getInitials } from "@/utils/get-initials";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MailIcon,
  Trash2Icon,
  UserMinusIcon,
  UsersIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useWorkspaceCard } from "../_hooks/useWorkspaceCard";

type RenameValues = z.infer<typeof renameWorkspaceSchema>;

interface WorkspaceCardProps {
  workspace: WorkspaceSummary;
  currentUserId: string;
}

export function WorkspaceCard({
  workspace,
  currentUserId,
}: WorkspaceCardProps) {
  const router = useRouter();
  const isOwner = workspace.role === "owner";

  const {
    expanded,
    setExpanded,
    members,
    loadingMembers,
    inviteEmail,
    setInviteEmail,
    inviting,
    removing,
    deleting,
    leaving,
    renameOpen,
    setRenameOpen,
    deleteOpen,
    setDeleteOpen,
    leaveOpen,
    setLeaveOpen,
    handleInvite,
    handleRemoveMember,
    handleDelete,
    handleLeave,
  } = useWorkspaceCard(workspace);

  const {
    control,
    handleSubmit,
    reset: resetRename,
    formState: { isSubmitting: renaming },
  } = useForm<RenameValues>({
    resolver: zodResolver(renameWorkspaceSchema),
    defaultValues: { workspaceId: workspace.id, name: workspace.name },
  });

  async function handleRename(values: RenameValues) {
    const result = await renameWorkspaceAction(values);

    if (!result.success) {
      appToast.error(result.error);
      return;
    }

    appToast.success("Workspace renomeado");
    setRenameOpen(false);
    resetRename({ workspaceId: workspace.id, name: values.name });
    router.refresh();
  }

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
            <div className="flex items-center gap-2">
              <span className="font-semibold font-heading text-sm truncate first-letter:uppercase">
                {workspace.name}
              </span>
              {workspace.isPersonal && (
                <span className="text-xs text-muted-foreground">(Pessoal)</span>
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

          <div className="flex items-center gap-1 shrink-0">
            {isOwner && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setRenameOpen(true);
                }}
                className="text-xs h-7"
              >
                Renomear
              </Button>
            )}
            {!workspace.isPersonal &&
              (isOwner ? (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteOpen(true);
                  }}
                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLeaveOpen(true);
                  }}
                  className="text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  {leaving ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Saindo...
                    </>
                  ) : (
                    "Sair"
                  )}
                </Button>
              ))}
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              className="h-7 w-7 p-0"
              aria-label={expanded ? "Recolher" : "Expandir"}
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
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-1.5">
                <UsersIcon className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Membros</span>
              </div>

              {loadingMembers ? (
                <div className="flex flex-col gap-2">
                  {Array.from({
                    length:
                      workspace.memberCount > 0
                        ? Math.min(workspace.memberCount, 4)
                        : 2,
                  }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-md shrink-0" />
                      <Skeleton className="h-3 flex-1 rounded" />
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {(members ?? []).map((m) => (
                    <div key={m.userId} className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 rounded-md shrink-0">
                        <AvatarImage
                          src={m.avatarUrl ?? undefined}
                          alt={m.name}
                          className="rounded-md object-cover"
                        />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary rounded-md">
                          {getInitials(m.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs flex-1 truncate">{m.name}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs px-1.5 py-2 h-4 font-normal shrink-0",
                          m.role === "owner"
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            : "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
                        )}
                      >
                        {m.role === "owner" ? "Proprietário" : "Membro"}
                      </Badge>
                      {isOwner && m.userId !== currentUserId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          disabled={removing === m.userId}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveMember(m.userId);
                          }}
                          aria-label="Remover membro"
                        >
                          <UserMinusIcon className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isOwner && (
                <>
                  <Separator />
                  <div className="flex flex-col gap-3">
                    <label className="text-sm flex items-center gap-1.5 font-medium leading-none">
                      <MailIcon className="size-4 text-muted-foreground" />
                      Convidar por email
                    </label>
                    <div className="flex gap-2">
                      <InputGroup className="flex-1">
                        <InputGroupInput
                          type="email"
                          placeholder="email@exemplo.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleInvite();
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={inviting}
                        />
                      </InputGroup>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInvite();
                        }}
                        disabled={inviting || !inviteEmail.trim()}
                      >
                        {inviting ? (
                          <>
                            <Spinner data-icon="inline-start" />
                            Enviando...
                          </>
                        ) : (
                          "Convidar"
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Rename Dialog */}
      <Dialog
        open={renameOpen}
        onOpenChange={(o) => {
          if (!o) setRenameOpen(false);
        }}
      >
        <DialogContent
          className="max-w-md"
          aria-describedby={undefined}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>Renomear workspace</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(handleRename)}
            className="flex flex-col gap-4 pt-2"
          >
            <Controller
              name="workspaceId"
              control={control}
              render={({ field }) => <input type="hidden" {...field} />}
            />
            <FieldGroup>
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Novo nome</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id={field.name}
                        {...field}
                        aria-invalid={fieldState.invalid}
                      />
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameOpen(false)}
                disabled={renaming}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={renaming}>
                {renaming ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog
        open={deleteOpen}
        onOpenChange={(o) => {
          if (!o && !deleting) setDeleteOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os dados deste workspace serão removidos permanentemente.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Deletando...
                </>
              ) : (
                "Deletar"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Alert */}
      <AlertDialog
        open={leaveOpen}
        onOpenChange={(o) => {
          if (!o && !leaving) setLeaveOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair do workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Você perderá acesso a este workspace e seus dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={leaving}>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleLeave}
              disabled={leaving}
            >
              {leaving ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Saindo...
                </>
              ) : (
                "Sair"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
