"use client";

import { BudgetDetail } from "@/actions/(user)/budgets/get-budget-by-id";
import { CategoryForBudget } from "@/actions/(user)/budgets/get-categories-for-budget";
import { Button } from "@/components/ui/button";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { buildCategoryGroups, findCategoryItem } from "@/utils/category-combobox";
import { budgetFormSchema } from "@/schemas/budgets/budget-form";
import { appToast } from "@/utils/app-toast";
import { formatCurrencyForInput, parseCurrencyInput } from "@/utils/parse-currency";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

interface BudgetFormProps {
  month: number;
  year: number;
  budget?: BudgetDetail;
  categoryType?: "expense" | "income";
  isLoadingCategories?: boolean;
  expenseCategories: CategoryForBudget[];
  incomeCategories: CategoryForBudget[];
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit: (
    data: z.infer<typeof budgetFormSchema>,
  ) => Promise<{ success: boolean; error?: string }>;
}

export function BudgetForm({
  month,
  year,
  budget,
  categoryType,
  isLoadingCategories = false,
  expenseCategories,
  incomeCategories,
  onSuccess,
  onCancel,
  onSubmit,
}: BudgetFormProps) {
  const isEditing = !!budget;
  const [raw, setRaw] = useState(formatCurrencyForInput(budget?.limitAmount));
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(
    null,
  );

  const form = useForm<z.infer<typeof budgetFormSchema>>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      categoryId: budget?.categoryId ?? "",
      limitAmount: budget?.limitAmount ?? undefined,
      month,
      year,
    },
  });

  async function handleSubmit(data: z.infer<typeof budgetFormSchema>) {
    const result = await onSubmit(data);
    if (result.success) {
      appToast.success(
        isEditing
          ? "Orçamento atualizado com sucesso."
          : "Orçamento criado com sucesso.",
      );
      onSuccess();
    } else {
      appToast.error(result.error ?? "Erro ao salvar orçamento.");
    }
  }

  const visibleExpense = categoryType === "income" ? [] : expenseCategories;
  const visibleIncome = categoryType === "expense" ? [] : incomeCategories;
  const noCategories = visibleExpense.length === 0 && visibleIncome.length === 0;

  return (
    <>
      <div ref={setPortalContainer} className="absolute" />
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-5"
    >
      <Controller
        name="categoryId"
        control={form.control}
        render={({ field, fieldState }) => {
          const categoryGroups = buildCategoryGroups(visibleExpense, visibleIncome);
          const selectedItem = findCategoryItem(categoryGroups, field.value);

          return (
            <Field>
              <FieldLabel
                htmlFor={field.name}
                className="text-sm font-medium"
                required
              >
                Categoria
              </FieldLabel>
              {isLoadingCategories ? (
                <Skeleton className="h-9 w-full" />
              ) : noCategories ? (
                <p className="text-sm text-muted-foreground rounded-md border border-dashed px-3 py-2">
                  Todas as categorias já possuem orçamento neste mês.
                </p>
              ) : (
                <Combobox
                  items={categoryGroups}
                  value={selectedItem}
                  onValueChange={(item) => field.onChange(item?.id ?? "")}
                  itemToStringLabel={(item) => item.name}
                >
                  <ComboboxInput
                    id={field.name}
                    placeholder="Selecione uma categoria"
                    aria-invalid={fieldState.invalid}
                    showTrigger
                  />
                  <ComboboxContent container={portalContainer}>
                    <ComboboxEmpty>Sem resultados.</ComboboxEmpty>
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
              )}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          );
        }}
      />

      <Controller
        name="limitAmount"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel
              htmlFor={field.name}
              className="text-sm font-medium"
              required
            >
              Valor limite (R$)
            </FieldLabel>
            {isEditing && isLoadingCategories ? (
              <Skeleton className="h-9 w-full" />
            ) : (
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
                    field.onChange(parseCurrencyInput(text));
                  }}
                />
              </InputGroup>
            )}
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto transition-transform ease-in hover:scale-103 active:scale-97"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={form.formState.isSubmitting || (!isEditing && noCategories)}
          className="w-full sm:w-auto transition-transform ease-in hover:scale-103 active:scale-97"
        >
          {form.formState.isSubmitting ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <SaveIcon className="h-4 w-4" />
          )}
          {isEditing
            ? form.formState.isSubmitting ? "Salvando..." : "Salvar alterações"
            : form.formState.isSubmitting ? "Criando..." : "Criar orçamento"}
        </Button>
      </div>
      </form>
    </>
  );
}
