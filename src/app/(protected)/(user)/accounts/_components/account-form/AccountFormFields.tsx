"use client";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/ui/combobox";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { buildCategoryGroups, findCategoryItem } from "@/utils/category-combobox";
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
            <FieldLabel htmlFor={field.name} className="text-md">
              Título
            </FieldLabel>
            <InputGroup>
              <InputGroupInput
                {...field}
                id={field.name}
                autoComplete="off"
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
        render={({ field, fieldState }) => {
          const categoryGroups = buildCategoryGroups(
            categories.filter((cat) => cat.type === "expense"),
            categories.filter((cat) => cat.type === "income"),
          );
          const selectedItem = findCategoryItem(categoryGroups, field.value);

          return (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-md">
                Categoria
              </FieldLabel>
              <Combobox
                items={categoryGroups}
                value={selectedItem}
                onValueChange={(item) => field.onChange(item?.id ?? null)}
                itemToStringLabel={(item) => item.name}
              >
                <ComboboxInput
                  id={field.name}
                  placeholder="Sem categoria"
                  aria-invalid={fieldState.invalid}
                  showTrigger
                  showClear={!!field.value}
                />
                <ComboboxContent>
                  <ComboboxEmpty>Nenhuma categoria encontrada.</ComboboxEmpty>
                  <ComboboxList>
                    {(group, index) => (
                      <ComboboxGroup key={group.label} items={group.items}>
                        <ComboboxLabel>{group.label}</ComboboxLabel>
                        <ComboboxCollection>
                          {(item) => (
                            <ComboboxItem key={item.id} value={item}>
                              {item.name}
                            </ComboboxItem>
                          )}
                        </ComboboxCollection>
                        {index < categoryGroups.length - 1 && (
                          <ComboboxSeparator />
                        )}
                      </ComboboxGroup>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          );
        }}
      />

      <Controller
        name="status"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name} className="text-md">
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
            <FieldLabel htmlFor={field.name} className="text-md">
              Descrição
            </FieldLabel>
            <InputGroup>
              <InputGroupTextarea
                {...field}
                id={field.name}
                autoComplete="off"
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
