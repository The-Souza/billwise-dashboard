import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { BudgetRow } from "@/actions/(user)/budgets/get-budgets";
import { DeleteBudgetDialog } from "@/app/(protected)/(user)/budgets/_components/DeleteBudgetDialog";

const budget: BudgetRow = {
  id: "1",
  categoryId: "cat-1",
  categoryName: "Alimentação",
  categoryIcon: null,
  categoryType: "expense" as BudgetRow["categoryType"],
  budgetAmount: 500,
  spentAmount: 200,
  month: 5,
  year: 2026,
  remainingAmount: 0,
  usedPercentage: 0,
};

describe("DeleteBudgetDialog", () => {
  it("não renderiza conteúdo quando fechado", () => {
    render(
      <DeleteBudgetDialog
        open={false}
        budget={budget}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("exibe título com nome da categoria do orçamento", () => {
    render(
      <DeleteBudgetDialog
        open={true}
        budget={budget}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText(/excluir "Alimentação"/i)).toBeInTheDocument();
  });

  it("exibe título genérico quando budget é null", () => {
    render(
      <DeleteBudgetDialog
        open={true}
        budget={null}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText(/excluir orçamento/i)).toBeInTheDocument();
  });

  it("chama onConfirm ao clicar em Excluir", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <DeleteBudgetDialog
        open={true}
        budget={budget}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^excluir$/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("chama onCancel ao clicar em Cancelar", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <DeleteBudgetDialog
        open={true}
        budget={budget}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("desabilita botões quando isDeleting é true", () => {
    render(
      <DeleteBudgetDialog
        open={true}
        budget={budget}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isDeleting={true}
      />,
    );
    expect(screen.getByRole("button", { name: /excluindo/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled();
  });
});
