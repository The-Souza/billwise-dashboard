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
            <div className="p-2 rounded-md bg-destructive/10">
              <AlertTriangleIcon className="h-4 w-4 text-destructive" />
            </div>
            {budget
              ? `Excluir "${budget.categoryName}"?`
              : "Excluir orçamento?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação é permanente e não pode ser desfeita.
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
