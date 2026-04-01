"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Controller } from "react-hook-form";
import { useAccountForm } from "./AccountFormContext";

export function AccountFormRecurrence() {
  const { form } = useAccountForm();

  return (
    <>
      <Separator />
      <div className="flex flex-col gap-1">
        <h3 className="text-md font-heading capitalize">Recorrência</h3>
        <p className="text-sm text-muted-foreground">
          Ajuste por quantos meses esta conta deve continuar sendo gerada.
        </p>
      </div>
      <Controller
        name="recurrenceMonths"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field className="max-w-xs">
            <FieldLabel htmlFor={field.name} className="text-md capitalize">
              Gerar próximos meses
            </FieldLabel>
            <Select
              value={field.value?.toString() ?? "none"}
              onValueChange={(v) =>
                field.onChange(v === "none" ? null : Number(v))
              }
              name={field.name}
            >
              <SelectTrigger aria-invalid={fieldState.invalid} id={field.name}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem limite definido</SelectItem>
                {[3, 6, 9, 12, 18, 24].map((months) => (
                  <SelectItem key={months} value={months.toString()}>
                    {months} meses
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </>
  );
}
