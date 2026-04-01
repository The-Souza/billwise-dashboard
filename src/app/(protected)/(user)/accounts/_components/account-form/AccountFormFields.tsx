"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDateLocal } from "@/helper/format-date";
import { parseDateLocal } from "@/helper/parse-date";
import { STATUS_OPTIONS } from "@/utils/status-options";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { useAccountForm } from "./AccountFormContext";

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
        render={({ field, fieldState }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [raw, setRaw] = useState(field.value?.toString() ?? "");

          return (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-md capitalize">
                Valor (R$)
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id={field.name}
                  type="text"
                  inputMode="decimal"
                  placeholder="0,00"
                  value={raw}
                  aria-invalid={fieldState.invalid}
                  onChange={(e) => {
                    const text = e.target.value;
                    setRaw(text);
                    const val = parseFloat(text.replace(",", "."));
                    field.onChange(isNaN(val) ? undefined : val);
                  }}
                />
              </InputGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          );
        }}
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
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
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
        render={({ field, fieldState }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [open, setOpen] = useState(false);
          const dateValue = field.value
            ? parseDateLocal(field.value)
            : undefined;

          return (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-md capitalize">
                Data da Conta
              </FieldLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id={field.name}
                    variant="outline"
                    className="w-full justify-between font-normal hover:bg-transparent dark:bg-input/30 bg-transparent shadow-xs px-3"
                    aria-invalid={fieldState.invalid}
                  >
                    {dateValue
                      ? dateValue.toLocaleDateString("pt-BR")
                      : "Selecione uma data"}
                    <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-70 overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={dateValue}
                    defaultMonth={dateValue}
                    onSelect={(date) => {
                      field.onChange(date ? formatDateLocal(date) : null);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          );
        }}
      />

      <Controller
        name="dueDate"
        control={form.control}
        render={({ field, fieldState }) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [open, setOpen] = useState(false);
          const dateValue = field.value
            ? parseDateLocal(field.value)
            : undefined;

          return (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-md capitalize">
                Vencimento
              </FieldLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id={field.name}
                    variant="outline"
                    className="w-full justify-between font-normal hover:bg-transparent dark:bg-input/30 bg-transparent shadow-xs px-3"
                    aria-invalid={fieldState.invalid}
                  >
                    {dateValue
                      ? dateValue.toLocaleDateString("pt-BR")
                      : "Selecione uma data"}
                    <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-70 overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    defaultMonth={dateValue}
                    selected={dateValue}
                    onSelect={(date) => {
                      field.onChange(date ? formatDateLocal(date) : null);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          );
        }}
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
