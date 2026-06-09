"use client";

import {
  getWorkspaceMembersAction,
  MemberSummary,
} from "@/actions/(user)/workspaces/get-workspace-members";
import { transferOwnershipAction } from "@/actions/(user)/workspaces/transfer-ownership";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { appToast } from "@/utils/app-toast";
import { getInitials } from "@/utils/get-initials";
import { CheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface WorkspaceTransferDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  workspaceId: string;
  currentUserId: string;
}

export function WorkspaceTransferDialog({
  open,
  onOpenChange,
  workspaceId,
  currentUserId,
}: WorkspaceTransferDialogProps) {
  const router = useRouter();
  const [members, setMembers] = useState<MemberSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transferring, setTransferring] = useState(false);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMembers(null);
      setSelectedId(null);
      return;
    }
    getWorkspaceMembersAction(workspaceId).then((result) => {
      setMembers(
        result.success
          ? result.data.filter((m) => m.userId !== currentUserId)
          : [],
      );
    });
  }, [open, workspaceId, currentUserId]);

  async function handleTransfer() {
    if (!selectedId) return;
    setTransferring(true);
    const result = await transferOwnershipAction({
      workspaceId,
      newOwnerId: selectedId,
    });
    setTransferring(false);
    if (!result.success) {
      appToast.error(result.error);
      return;
    }
    appToast.success("Propriedade transferida com sucesso");
    onOpenChange(false);
    router.refresh();
  }

  const eligibleMembers = members ?? [];

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!transferring) onOpenChange(o);
      }}
    >
      <DialogContent
        className="w-[calc(100vw-2rem)] rounded-md max-w-md"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Transferir propriedade</DialogTitle>
          <DialogDescription>
            Selecione o novo proprietário. Você se tornará um membro comum e
            esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {members === null ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-md border border-border p-2"
              >
                <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-2.5 w-16 rounded" />
                </div>
              </div>
            ))
          ) : eligibleMembers.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhum membro disponível para receber a propriedade.
            </p>
          ) : (
            eligibleMembers.map((m) => (
              <button
                key={m.userId}
                type="button"
                onClick={() => setSelectedId(m.userId)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md border p-2 text-left transition-colors",
                  selectedId === m.userId
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50",
                )}
              >
                <Avatar className="h-8 w-8 shrink-0 rounded-md">
                  <AvatarImage
                    src={m.avatarUrl ?? undefined}
                    alt={m.name}
                    className="rounded-md object-cover"
                  />
                  <AvatarFallback className="rounded-md bg-primary/10 text-xs text-primary">
                    {getInitials(m.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">{m.name}</span>
                  <span className="text-xs text-muted-foreground">Membro</span>
                </div>
                {selectedId === m.userId && (
                  <CheckIcon className="size-4 shrink-0 text-primary" />
                )}
              </button>
            ))
          )}
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={transferring}
            className="w-full sm:w-auto transition-transform ease-in hover:scale-103 active:scale-97"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleTransfer}
            disabled={!selectedId || transferring}
            className="w-full sm:w-auto transition-transform ease-in hover:scale-103 active:scale-97"
          >
            {transferring ? (
              <>
                <Spinner data-icon="inline-start" />
                Transferindo...
              </>
            ) : (
              "Transferir"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
