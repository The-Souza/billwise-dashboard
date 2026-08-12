import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BudgetDetail } from "@/actions/(user)/budgets/get-budget-by-id";
import type { CategoryForBudget } from "@/actions/(user)/budgets/get-categories-for-budget";
import { BudgetForm } from "@/app/(protected)/(user)/budgets/_components/BudgetForm";

const budget: BudgetDetail = {
  id: "budget-1",
  categoryId: "cat-alimentacao",
  categoryName: "Alimentação",
  limitAmount: 500,
  month: 5,
  year: 2026,
};

const expenseCategories: CategoryForBudget[] = [
  { id: "cat-alimentacao", name: "Alimentação", type: "expense", icon: null },
  { id: "cat-transporte", name: "Transporte", type: "expense", icon: null },
];

describe("BudgetForm — edição de categoria", () => {
  it("permite trocar a categoria ao editar (campo não fica desabilitado)", () => {
    render(
      <BudgetForm
        month={5}
        year={2026}
        budget={budget}
        expenseCategories={expenseCategories}
        incomeCategories={[]}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    const categoryInput = screen.getByPlaceholderText(/selecione uma categoria/i);
    expect(categoryInput).not.toBeDisabled();
  });

  it("não mostra mais o texto 'A categoria não pode ser alterada'", () => {
    render(
      <BudgetForm
        month={5}
        year={2026}
        budget={budget}
        expenseCategories={expenseCategories}
        incomeCategories={[]}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.queryByText(/a categoria não pode ser alterada/i),
    ).not.toBeInTheDocument();
  });

  it("inclui a categoria de outras opções (ex: Transporte) na lista disponível para troca", () => {
    render(
      <BudgetForm
        month={5}
        year={2026}
        budget={budget}
        expenseCategories={expenseCategories}
        incomeCategories={[]}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    // A troca real de valor via popup do Combobox (Base UI) é coberta pela
    // action updateBudgetAction (ver update-budget.test.ts); aqui só
    // garantimos que o campo não está mais travado numa categoria fixa.
    const categoryInput = screen.getByPlaceholderText(
      /selecione uma categoria/i,
    ) as HTMLInputElement;
    expect(categoryInput.value).toBe("Alimentação");
    expect(categoryInput).not.toBeDisabled();
  });

  it("mostra um skeleton no campo de categoria enquanto as categorias carregam", () => {
    const { container } = render(
      <BudgetForm
        month={5}
        year={2026}
        budget={budget}
        isLoadingCategories
        expenseCategories={[]}
        incomeCategories={[]}
        onSuccess={vi.fn()}
        onCancel={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.queryByPlaceholderText(/selecione uma categoria/i),
    ).not.toBeInTheDocument();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
