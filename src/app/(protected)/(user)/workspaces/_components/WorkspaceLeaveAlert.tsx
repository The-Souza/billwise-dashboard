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

interface WorkspaceLeaveAlertProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  leaving: boolean;
  onConfirm: () => void;
}

export function WorkspaceLeaveAlert({
  open,
  onOpenChange,
  leaving,
  onConfirm,
}: WorkspaceLeaveAlertProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!leaving) onOpenChange(o);
      }}
    >
      <AlertDialogContent className="w-[calc(100vw-2rem)] rounded-md max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Sair do workspace</AlertDialogTitle>
          <AlertDialogDescription>
            Você perderá acesso a este workspace e seus dados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={leaving}
            className="transition-transform ease-in hover:scale-103 active:scale-97"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={leaving}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-transform ease-in hover:scale-103 active:scale-97"
          >
            {leaving ? (
              <>
                <Spinner data-icon="inline-start" />
                Saindo...
              </>
            ) : (
              "Sair"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
