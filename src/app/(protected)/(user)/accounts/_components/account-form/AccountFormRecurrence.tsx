"use client";

import { Field, FieldError } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Controller } from "react-hook-form";
import { useAccountForm } from "./AccountFormContext";
import { RecurrenceDurationInput } from "./RecurrenceDurationInput";

export function AccountFormRecurrence() {
  const { form } = useAccountForm();

  return (
    <>
      <Separator />
      <div className="flex flex-col gap-1">
        <h3 className="text-md font-heading">Recorrência</h3>
        <p className="text-sm text-muted-foreground">
          Ajuste por quantos meses esta conta deve continuar sendo gerada.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Controller
          name="recurrenceMonths"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <RecurrenceDurationInput
                value={field.value ?? null}
                onChange={field.onChange}
                fieldName={field.name}
                invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </>
  );
}
