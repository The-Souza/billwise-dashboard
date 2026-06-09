"use client";

import { MemberSummary } from "@/actions/(user)/workspaces/get-workspace-members";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Spinner } from "@/components/ui/spinner";

interface WorkspaceRemoveMemberAlertProps {
  target: MemberSummary | null;
  removing: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function WorkspaceRemoveMemberAlert({
  target,
  removing,
  onClose,
  onConfirm,
}: WorkspaceRemoveMemberAlertProps) {
  return (
    <AlertDialog
      open={target !== null}
      onOpenChange={(o) => {
        if (!o && removing === null) onClose();
      }}
    >
      <AlertDialogContent className="w-[calc(100vw-2rem)] rounded-md max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Remover membro</AlertDialogTitle>
          <AlertDialogDescription>
            {target && (
              <>
                <strong>{target.name}</strong> perderá acesso a este workspace e
                seus dados.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={removing !== null}
            className="transition-transform ease-in hover:scale-103 active:scale-97"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={removing !== null}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-transform ease-in hover:scale-103 active:scale-97"
          >
            {removing !== null ? (
              <>
                <Spinner data-icon="inline-start" />
                Removendo...
              </>
            ) : (
              "Remover"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
