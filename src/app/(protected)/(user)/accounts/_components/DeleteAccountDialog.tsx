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
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading flex gap-2 items-center">
            <div className="p-2 rounded-md bg-primary/10">
              <AlertTriangleIcon className="h-4 w-4 text-primary" />
            </div>
            {isSingle
              ? `Excluir "${accounts[0].title}"?`
              : `Excluir ${count} contas?`}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <p>Esta ação é permanente e não pode ser desfeita.</p>
              {(hasInstallments || hasRecurring) && (
                <div className="flex flex-col gap-1.5 rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 p-3">
                  {hasInstallments && (
                    <p className="text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                      <span className="shrink-0">⚠</span>
                      <span>
                        {isSingle
                          ? "Esta conta possui parcelas"
                          : "Algumas contas possuem parcelas"}{" "}
                        — todas serão excluídas junto.
                      </span>
                    </p>
                  )}
                  {hasRecurring && (
                    <p className="text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                      <span className="shrink-0">⚠</span>
                      <span>
                        {isSingle
                          ? "Esta conta é recorrente"
                          : "Algumas contas são recorrentes"}{" "}
                        — a regra de recorrência também será excluída.
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-primary hover:bg-primary/90"
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
