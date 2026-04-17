"use client";

import { BudgetRow } from "@/actions/(user)/budgets/get-budgets";
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

interface DeleteBudgetDialogProps {
  open: boolean;
  budget: BudgetRow | null;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteBudgetDialog({
  open,
  budget,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteBudgetDialogProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="w-[calc(100vw-2rem)] rounded-md max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading flex gap-2 items-center">
            <div className="p-2 rounded-md bg-primary/10">
              <AlertTriangleIcon className="h-4 w-4 text-primary" />
            </div>
            {budget ? `Excluir "${budget.categoryName}"?` : "Excluir orçamento?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação é permanente e não pode ser desfeita.
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
