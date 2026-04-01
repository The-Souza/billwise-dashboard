"use client";

import { Separator } from "@/components/ui/separator";
import { useAccountForm } from "./AccountFormContext";

export function AccountFormInstallments() {
  const { account } = useAccountForm();
  if (!account) return null;

  return (
    <>
      <Separator />
      <div className="flex flex-col gap-1">
        <h3 className="text-md font-heading">Parcelas</h3>
        <p className="text-sm text-muted-foreground">
          {account.siblings.length} parcelas vinculadas a esta conta.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {account.siblings.map((sib) => {
          const isCurrent = sib.id === account.id;

          const statusLabel =
            sib.status === "paid"
              ? "Pago"
              : sib.status === "overdue"
                ? "Vencido"
                : "Pendente";

          const statusClass =
            sib.status === "paid"
              ? "text-emerald-500"
              : sib.status === "overdue"
                ? "text-destructive"
                : "text-muted-foreground";

          return (
            <div
              key={sib.id}
              className={`flex flex-col gap-1 rounded-md border px-3 py-2 text-sm shadow-xs transition-colors ${
                isCurrent
                  ? "border-primary bg-primary/5"
                  : "dark:bg-input/30 bg-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  Parcela {sib.number}/{account.siblings.length}
                </span>
                {isCurrent && (
                  <span className="text-xs text-primary font-medium">
                    Atual
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>
                  {String(sib.month).padStart(2, "0")}/{sib.year}
                </span>
                <span className="font-medium text-foreground">
                  R$ {sib.amount.toFixed(2).replace(".", ",")}
                </span>
                <span className={statusClass}>{statusLabel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
