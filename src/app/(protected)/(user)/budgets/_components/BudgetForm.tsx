"use client";

import { BudgetDetail } from "@/actions/(user)/budgets/get-budget-by-id";
import { CategoryForBudget } from "@/actions/(user)/budgets/get-categories-for-budget";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
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
import { Spinner } from "@/components/ui/spinner";
import { budgetFormSchema } from "@/schemas/budgets/budget-form";
import { appToast } from "@/utils/app-toast";
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
  expenseCategories,
  incomeCategories,
  onSuccess,
  onCancel,
  onSubmit,
}: BudgetFormProps) {
  const isEditing = !!budget;
  const [raw, setRaw] = useState(budget?.limitAmount?.toString() ?? "");

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

  const hasExpense = visibleExpense.length > 0;
  const hasIncome = visibleIncome.length > 0;
  const noCategories = !hasExpense && !hasIncome;

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col gap-5"
    >
      {isEditing ? (
        <Field>
          <FieldLabel className="text-sm font-medium">Categoria</FieldLabel>
          <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm text-muted-foreground select-none">
            {budget.categoryName}
          </div>
          <p className="text-xs text-muted-foreground">
            A categoria não pode ser alterada.
          </p>
        </Field>
      ) : (
        <Controller
          name="categoryId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name} className="text-sm font-medium">
                Categoria
              </FieldLabel>
              {noCategories ? (
                <p className="text-sm text-muted-foreground rounded-md border border-dashed px-3 py-2">
                  Todas as categorias já possuem orçamento neste mês.
                </p>
              ) : (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  name={field.name}
                >
                  <SelectTrigger
                    aria-invalid={fieldState.invalid}
                    id={field.name}
                  >
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {hasExpense && (
                      <SelectGroup>
                        <SelectLabel className="text-muted-foreground text-xs">
                          Despesas
                        </SelectLabel>
                        {visibleExpense.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                    {hasExpense && hasIncome && <SelectSeparator />}
                    {hasIncome && (
                      <SelectGroup>
                        <SelectLabel className="text-muted-foreground text-xs">
                          Receitas
                        </SelectLabel>
                        {visibleIncome.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>
              )}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}

      <Controller
        name="limitAmount"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor={field.name} className="text-sm font-medium">
              Valor limite
            </FieldLabel>
            <InputGroup>
              <InputGroupAddon className="text-muted-foreground text-sm font-medium">
                R$
              </InputGroupAddon>
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
          {isEditing ? "Salvar alterações" : "Criar orçamento"}
        </Button>
      </div>
    </form>
  );
}
