"use client";

import { deleteRecurringRuleAction } from "@/actions/(user)/settings/delete-recurring-rule";
import type { RecurringRuleRow } from "@/actions/(user)/settings/get-recurring-rules";
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
import { appToast } from "@/utils/app-toast";
import { capitalizeFirst } from "@/utils/format-text";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";

interface DeleteRuleAlertDialogProps {
  rule: RecurringRuleRow | null;
  onClose: () => void;
  onDeleted: () => void;
}

export function DeleteRuleAlertDialog({
  rule,
  onClose,
  onDeleted,
}: DeleteRuleAlertDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    if (!rule) return;
    setIsDeleting(true);

    const res = await deleteRecurringRuleAction(rule.id);

    if (res.success) {
      appToast.success("Regra excluída com sucesso.");
      onDeleted();
    } else {
      appToast.error(res.error);
    }

    setIsDeleting(false);
  }

  return (
    <AlertDialog open={!!rule}>
      <AlertDialogContent className="w-[calc(100vw-2rem)] rounded-md max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading flex gap-2 items-center">
            <div className="p-2 rounded-md bg-destructive/10">
              <Trash2Icon className="h-4 w-4 text-destructive" />
            </div>
            Excluir &ldquo;{capitalizeFirst(rule?.title ?? "")}&rdquo;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            A regra e todas as contas com status{" "}
            <strong>pendente</strong> vinculadas a ela serão removidas. Esta
            ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="transition-transform ease-in hover:scale-103 active:scale-97"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
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
