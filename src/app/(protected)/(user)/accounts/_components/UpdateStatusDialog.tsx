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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { account_status } from "@/generated/prisma/enums";
import { STATUS_OPTIONS } from "@/utils/status-options";
import { useState } from "react";

interface UpdateStatusDialogProps {
  open: boolean;
  accounts: AccountRow[];
  onConfirm: (status: account_status) => void;
  onCancel: () => void;
  isUpdating?: boolean;
}

export function UpdateStatusDialog({
  open,
  accounts,
  onConfirm,
  onCancel,
  isUpdating,
}: UpdateStatusDialogProps) {
  const [status, setStatus] = useState<account_status>(
    account_status.paid,
  );
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setStatus(account_status.paid);
  }

  const count = accounts.length;
  const isSingle = count === 1;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o && !isUpdating) onCancel();
      }}
    >
      <AlertDialogContent className="w-[calc(100vw-2rem)] rounded-md max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading">
            {isSingle
              ? `Alterar status de "${accounts[0].title}"`
              : `Alterar status de ${count} contas`}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground">
              <p>Selecione o novo status para as contas selecionadas.</p>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as account_status)}
              >
                <SelectTrigger aria-label="Novo status" className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="transition-transform ease-in hover:scale-103 active:scale-97"
            disabled={isUpdating}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onConfirm(status)}
            disabled={isUpdating}
            className="transition-transform ease-in hover:scale-103 active:scale-97"
          >
            {isUpdating ? (
              <>
                <Spinner data-icon="inline-start" />
                Atualizando...
              </>
            ) : (
              "Confirmar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
