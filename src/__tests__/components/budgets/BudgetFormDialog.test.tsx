import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("swr", () => ({
  default: vi.fn(() => ({
    data: { success: true, expense: [], income: [] },
    isLoading: false,
  })),
}));

vi.mock("@/actions/(user)/budgets/create-budget", () => ({
  createBudgetAction: vi.fn(),
}));

vi.mock("@/actions/(user)/budgets/update-budget", () => ({
  updateBudgetAction: vi.fn(),
}));

vi.mock("@/actions/(user)/budgets/get-categories-for-budget", () => ({
  getCategoriesForBudgetAction: vi.fn(),
}));

import { BudgetFormDialog } from "@/app/(protected)/(user)/budgets/_components/BudgetFormDialog";

const baseProps = {
  open: true,
  mode: "create" as const,
  month: 5,
  year: 2026,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

describe("BudgetFormDialog", () => {
  it("não renderiza quando fechado", () => {
    render(<BudgetFormDialog {...baseProps} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("exibe título 'Novo orçamento de despesa' no modo create/expense", () => {
    render(<BudgetFormDialog {...baseProps} categoryType="expense" />);
    expect(screen.getByText(/novo orçamento de despesa/i)).toBeInTheDocument();
  });

  it("exibe título 'Nova meta de receita' no modo create/income", () => {
    render(<BudgetFormDialog {...baseProps} categoryType="income" />);
    expect(screen.getByText(/nova meta de receita/i)).toBeInTheDocument();
  });

  it("exibe título 'Editar orçamento' no modo edit", () => {
    render(
      <BudgetFormDialog
        {...baseProps}
        mode="edit"
        budget={{
          id: "1",
          categoryId: "cat-1",
          categoryName: "Alimentação",
          categoryIcon: null,
          categoryType: "expense" as const,
          budgetAmount: 500,
          spentAmount: 200,
          month: 5,
          year: 2026,
          usedPercentage: 0,
          remainingAmount: 0,
        }}
      />,
    );
    expect(screen.getByText(/editar orçamento/i)).toBeInTheDocument();
  });

  it("exibe o mês e ano na descrição", () => {
    render(<BudgetFormDialog {...baseProps} categoryType="expense" />);
    expect(screen.getByText(/maio.*2026/i)).toBeInTheDocument();
  });

  it("chama onClose ao fechar o dialog", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<BudgetFormDialog {...baseProps} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
