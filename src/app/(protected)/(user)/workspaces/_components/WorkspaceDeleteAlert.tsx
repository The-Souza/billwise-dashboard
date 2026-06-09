"use client";

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

interface WorkspaceDeleteAlertProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  deleting: boolean;
  onConfirm: () => void;
}

export function WorkspaceDeleteAlert({
  open,
  onOpenChange,
  deleting,
  onConfirm,
}: WorkspaceDeleteAlertProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!deleting) onOpenChange(o);
      }}
    >
      <AlertDialogContent className="w-[calc(100vw-2rem)] rounded-md max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Deletar workspace</AlertDialogTitle>
          <AlertDialogDescription>
            Todos os dados deste workspace serão removidos permanentemente. Esta
            ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleting}
            className="transition-transform ease-in hover:scale-103 active:scale-97"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={deleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-transform ease-in hover:scale-103 active:scale-97"
          >
            {deleting ? (
              <>
                <Spinner data-icon="inline-start" />
                Deletando...
              </>
            ) : (
              "Deletar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
