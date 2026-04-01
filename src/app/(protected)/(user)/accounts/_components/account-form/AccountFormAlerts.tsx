"use client";

import { AppAlert } from "@/components/ui/app-alert";
import { useAccountForm } from "./AccountFormContext";

export function AccountFormAlerts() {
  const { form, isRecurring, hasInstallments } = useAccountForm();
  const editScope = form.watch("editScope");

  return (
    <div className="flex flex-col gap-2">
      {editScope === "single" && isRecurring && (
        <AppAlert
          variant="alert"
          title="No escopo 'Apenas esta conta' as alterações serão aplicadas somente a esta conta, as próximas recorrências manterão os dados anteriores."
        />
      )}
      {editScope === "future" && isRecurring && (
        <AppAlert
          variant="alert"
          title="No escopo 'Esta e próximas recorrências' as alterações serão aplicadas a esta conta e às próximas recorrências."
        />
      )}
      {editScope === "single" && hasInstallments && (
        <AppAlert
          variant="alert"
          title="No escopo 'Apenas esta conta', o valor informado será salvo somente nesta parcela."
        />
      )}
      {editScope === "all" && hasInstallments && (
        <AppAlert
          variant="alert"
          title="No escopo 'Todas as contas', o valor informado será aplicado individualmente a cada parcela."
        />
      )}
    </div>
  );
}
