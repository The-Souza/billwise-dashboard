"use client";

import { AccountRow } from "@/actions/(user)/accounts/get-accounts";
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
import { AppAlert } from "@/components/ui/app-alert";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangleIcon } from "lucide-react";

interface DeleteAccountDialogProps {
  open: boolean;
  accounts: AccountRow[];
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteAccountDialog({
  open,
  accounts,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteAccountDialogProps) {
  const count = accounts.length;
  const isSingle = count === 1;

  const hasInstallments = accounts.some((a) => a.installments !== null);
  const hasRecurring = accounts.some((a) => a.isRecurring);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="w-[calc(100vw-2rem)] rounded-md max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading flex gap-2 items-center">
            <div className="p-2 rounded-md bg-destructive/10">
              <AlertTriangleIcon className="h-4 w-4 text-destructive" />
            </div>
            {isSingle
              ? `Excluir "${accounts[0].title}"?`
              : `Excluir ${count} contas?`}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <p>Esta ação é permanente e não pode ser desfeita.</p>
              {(hasInstallments || hasRecurring) && (
                <AppAlert
                  variant="alert"
                  title="Atenção"
                  items={
                    [
                      hasInstallments
                        ? isSingle
                          ? "Esta conta possui parcelas — todas serão excluídas junto."
                          : "Algumas contas possuem parcelas — todas serão excluídas junto."
                        : null,
                      hasRecurring
                        ? isSingle
                          ? "Esta conta é recorrente — a regra também será excluída."
                          : "Algumas contas são recorrentes — a regra também será excluída."
                        : null,
                    ].filter(Boolean) as string[]
                  }
                />
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="transition-transform ease-in hover:scale-103 active:scale-97"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-transform ease-in hover:scale-103 active:scale-97"
          >
            {isDeleting ? (
              <>
                <Spinner data-icon="inline-start" />
                Excluindo...
              </>
            ) : (
              "Excluir"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
