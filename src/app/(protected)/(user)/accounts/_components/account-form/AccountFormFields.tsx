"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_OPTIONS } from "@/utils/status-options";
import { Controller } from "react-hook-form";
import { useAccountForm } from "./AccountFormContext";
import { CurrencyInputField } from "./CurrencyInputField";
import { DatePickerField } from "./DatePickerField";

export function AccountFormFields() {
  const { form, categories } = useAccountForm();

  return (
    <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <Controller
        name="title"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name} className="text-md capitalize">
              Título
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                {...field}
                id={field.name}
                placeholder="Ex: Aluguel, Salário..."
                aria-invalid={fieldState.invalid}
              />
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="amount"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <CurrencyInputField field={field} fieldState={fieldState} />
          </Field>
        )}
      />

      <Controller
        name="categoryId"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name} className="text-md capitalize">
              Categoria
            </FieldLabel>
            <Select
              value={field.value ?? "none"}
              onValueChange={(v) => field.onChange(v === "none" ? null : v)}
              name={field.name}
            >
              <SelectTrigger aria-invalid={fieldState.invalid} id={field.name}>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectGroup>
                  <SelectLabel className="text-muted-foreground text-xs">
                    Sem categoria
                  </SelectLabel>
                  <SelectItem value="none">Sem categoria</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel className="text-muted-foreground text-xs">
                    Despesas
                  </SelectLabel>
                  {categories
                    .filter((cat) => cat.type === "expense")
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel className="text-muted-foreground text-xs">
                    Receitas
                  </SelectLabel>
                  {categories
                    .filter((cat) => cat.type === "income")
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="status"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name} className="text-md capitalize">
              Status
            </FieldLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              name={field.name}
            >
              <SelectTrigger aria-invalid={fieldState.invalid} id={field.name}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="accountDate"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <DatePickerField
              field={field}
              fieldState={fieldState}
              label="Data da Conta"
            />
          </Field>
        )}
      />

      <Controller
        name="dueDate"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <DatePickerField
              field={field}
              fieldState={fieldState}
              label="Vencimento"
            />
          </Field>
        )}
      />

      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
            <FieldLabel htmlFor={field.name} className="text-md capitalize">
              Descrição
            </FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                id={field.name}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || null)}
                placeholder="Observações sobre esta conta..."
                maxLength={100}
                aria-invalid={fieldState.invalid}
              />
              <InputGroupAddon align="block-end">
                <InputGroupText className="tabular-nums">
                  {field.value?.length ?? 0}/100
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </FieldGroup>
  );
}
