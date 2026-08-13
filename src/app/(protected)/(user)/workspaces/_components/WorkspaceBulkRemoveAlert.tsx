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

interface WorkspaceBulkRemoveAlertProps {
  open: boolean;
  targets: MemberSummary[];
  removing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function WorkspaceBulkRemoveAlert({
  open,
  targets,
  removing,
  onClose,
  onConfirm,
}: WorkspaceBulkRemoveAlertProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !removing) onClose();
      }}
    >
      <AlertDialogContent className="w-[calc(100vw-2rem)] rounded-md max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Remover {targets.length}{" "}
            {targets.length === 1 ? "membro" : "membros"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {targets.length === 1 ? (
              <>
                <strong>{targets[0].name}</strong> perderá acesso a este
                workspace e seus dados.
              </>
            ) : (
              "Os membros selecionados perderão acesso a este workspace e seus dados."
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={removing}
            className="transition-transform ease-in hover:scale-103 active:scale-97"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={removing}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-transform ease-in hover:scale-103 active:scale-97"
          >
            {removing ? (
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
