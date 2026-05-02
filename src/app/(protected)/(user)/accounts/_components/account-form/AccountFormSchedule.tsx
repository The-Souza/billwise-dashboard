"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Controller, useWatch } from "react-hook-form";
import { useAccountForm } from "./AccountFormContext";
import { RecurrenceDurationInput } from "./RecurrenceDurationInput";

export function AccountFormSchedule() {
  const { form } = useAccountForm();
  const { scheduleType } = useWatch({
    control: form.control,
  });
  const isRecurringForm = scheduleType === "recurring";
  const hasInstallmentsForm = scheduleType === "installments";

  return (
    <>
      <Separator />
      <div className="flex flex-col gap-1">
        <h3 className="text-md font-heading">Configurações da conta</h3>
        <p className="text-sm text-muted-foreground">
          Configure recorrência ou parcelamento
        </p>
      </div>

      <Controller
        name="scheduleType"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor={field.name} className="text-md">
              Tipo de configuração
            </FieldLabel>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="flex gap-6"
            >
              {["none", "recurring", "installments"].map((type) => (
                <div key={type} className="flex items-center gap-3">
                  <RadioGroupItem value={type} id={type} />
                  <Label htmlFor={type}>
                    {type === "none"
                      ? "Normal"
                      : type === "recurring"
                        ? "Recorrente"
                        : "Parcelado"}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </Field>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                disabled={!isRecurringForm}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="installments"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-md">
                Quantidade de parcelas
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={field.name}
                  type="number"
                  min={2}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === "") {
                      field.onChange(null);
                    } else {
                      const n = parseInt(raw, 10);
                      if (!isNaN(n)) field.onChange(n);
                    }
                  }}
                  placeholder={hasInstallmentsForm ? "Ex: 12" : "—"}
                  disabled={!hasInstallmentsForm}
                  aria-invalid={fieldState.invalid}
                />
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </>
  );
}
