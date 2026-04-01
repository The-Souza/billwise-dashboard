"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Controller } from "react-hook-form";
import { useAccountForm } from "./AccountFormContext";

export function AccountFormScope() {
  const { form, isRecurring, hasInstallments } = useAccountForm();

  return (
    <>
      <Separator />
      <div className="flex flex-col gap-1">
        <h3 className="text-md font-heading capitalize">Escopo da alteração</h3>
        <p className="text-sm text-muted-foreground">
          Escolha como deseja aplicar as alterações
        </p>
      </div>
      <Controller
        name="editScope"
        control={form.control}
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            id={field.name}
            onValueChange={field.onChange}
            className="flex gap-6"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single">Apenas esta conta</Label>
            </div>
            {isRecurring && (
              <div className="flex items-center gap-3">
                <RadioGroupItem value="future" id="future" />
                <Label htmlFor="future">Esta e próximas recorrências</Label>
              </div>
            )}
            {hasInstallments && (
              <div className="flex items-center gap-3">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">Todas as parcelas</Label>
              </div>
            )}
          </RadioGroup>
        )}
      />
    </>
  );
}
