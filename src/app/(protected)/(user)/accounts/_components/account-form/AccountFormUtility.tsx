"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Controller } from "react-hook-form";
import { useAccountForm } from "./AccountFormContext";

export function AccountFormUtility() {
  const { form } = useAccountForm();

  return (
    <>
      <Separator />
      <div className="flex flex-col gap-1">
        <h3 className="text-md font-heading">Detalhes de consumo</h3>
        <p className="text-sm text-muted-foreground">
          Campos específicos para contas de água, energia, internet e gás.
        </p>
      </div>
      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Controller
          name="consumption"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-md">
                Consumo
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ex: 150 kWh, 12 m³..."
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? e.target.valueAsNumber : null,
                    )
                  }
                  aria-invalid={fieldState.invalid}
                />
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="days"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-md">
                Dias do ciclo
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  id={field.name}
                  type="number"
                  step="1"
                  min="1"
                  placeholder="Ex: 30"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? e.target.valueAsNumber : null,
                    )
                  }
                  aria-invalid={fieldState.invalid}
                />
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
    </>
  );
}
