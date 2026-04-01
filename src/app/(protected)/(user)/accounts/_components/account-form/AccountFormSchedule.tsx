"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

export function AccountFormSchedule() {
  const { form } = useAccountForm();
  const scheduleType = form.watch("scheduleType");
  const isRecurringForm = scheduleType === "recurring";
  const hasInstallmentsForm = scheduleType === "installments";

  return (
    <>
      <Separator />
      <div className="flex flex-col gap-1">
        <h3 className="text-md font-heading capitalize">
          Configurações da Conta
        </h3>
        <p className="text-sm text-muted-foreground">
          Configure recorrência ou parcelamento
        </p>
      </div>

      <Controller
        name="scheduleType"
        control={form.control}
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor={field.name} className="text-md capitalize">
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
              <FieldLabel htmlFor={field.name} className="text-md capitalize">
                Gerar próximos meses
              </FieldLabel>
              <Select
                value={field.value?.toString() ?? "none"}
                onValueChange={(v) =>
                  field.onChange(v === "none" ? null : Number(v))
                }
                disabled={!isRecurringForm}
                name={field.name}
              >
                <SelectTrigger aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    Não gerar automaticamente
                  </SelectItem>
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

        <Controller
          name="installments"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-md capitalize">
                Quantidade de parcelas
              </FieldLabel>
              <Select
                value={field.value?.toString() ?? "none"}
                onValueChange={(v) =>
                  field.onChange(v === "none" ? null : Number(v))
                }
                disabled={!hasInstallmentsForm}
                name={field.name}
              >
                <SelectTrigger aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem parcelamento</SelectItem>
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} parcelas
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </>
  );
}
