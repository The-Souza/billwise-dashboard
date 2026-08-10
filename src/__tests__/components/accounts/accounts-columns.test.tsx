import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Row } from "@tanstack/react-table";

import { accountColumns } from "@/app/(protected)/(user)/accounts/_components/accounts-columns";
import type { AccountRow } from "@/actions/(user)/accounts/get-accounts";

function makeAccount(overrides: Partial<AccountRow> = {}): AccountRow {
  return {
    id: "acc-1",
    title: "Aluguel",
    category: "Moradia",
    categoryIcon: null,
    categoryType: "expense",
    amount: 100,
    dueDate: null,
    status: "pending",
    isRecurring: false,
    installments: null,
    ...overrides,
  };
}

function makeRow(account: AccountRow): Row<AccountRow> {
  return {
    original: account,
    getValue: (key: string) => account[key as keyof AccountRow],
    getIsSelected: () => false,
    toggleSelected: vi.fn(),
  } as unknown as Row<AccountRow>;
}

describe("accountColumns", () => {
  const columns = accountColumns(vi.fn());
  const selectColumn = columns[0];
  const amountColumn = columns[7];
  const actionsColumn = columns[8];

  it("renderiza o valor de uma despesa pendente sem a cor de alarme", () => {
    const row = makeRow(makeAccount({ status: "pending" }));
    const cell = amountColumn.cell as (ctx: { row: Row<AccountRow> }) => React.ReactElement;
    render(cell({ row }));
    expect(screen.getByText(/R\$\s?100,00/)).not.toHaveClass("text-destructive");
  });

  it("renderiza o valor de uma despesa vencida com a cor de alarme", () => {
    const row = makeRow(makeAccount({ status: "overdue" }));
    const cell = amountColumn.cell as (ctx: { row: Row<AccountRow> }) => React.ReactElement;
    render(cell({ row }));
    expect(screen.getByText(/R\$\s?100,00/)).toHaveClass("text-destructive");
  });

  it("renderiza o valor de uma despesa paga sem a cor de alarme", () => {
    const row = makeRow(makeAccount({ status: "paid" }));
    const cell = amountColumn.cell as (ctx: { row: Row<AccountRow> }) => React.ReactElement;
    render(cell({ row }));
    expect(screen.getByText(/R\$\s?100,00/)).not.toHaveClass("text-destructive");
  });

  it("mostra o ícone de tendência de alta (receita) para categoria de receita", () => {
    const row = makeRow(makeAccount({ categoryType: "income" }));
    const cell = amountColumn.cell as (ctx: { row: Row<AccountRow> }) => React.ReactElement;
    const { container } = render(cell({ row }));
    expect(container.querySelector("svg.lucide-trending-up")).toBeInTheDocument();
  });

  it("mostra o ícone de tendência de baixa (despesa) para categoria de despesa", () => {
    const row = makeRow(makeAccount({ categoryType: "expense" }));
    const cell = amountColumn.cell as (ctx: { row: Row<AccountRow> }) => React.ReactElement;
    const { container } = render(cell({ row }));
    expect(
      container.querySelector("svg.lucide-trending-down"),
    ).toBeInTheDocument();
  });

  it("dá um aria-label específico (não genérico) ao checkbox de cada linha", () => {
    const row = makeRow(makeAccount({ title: "Conta de luz" }));
    const cell = selectColumn.cell as (ctx: { row: Row<AccountRow> }) => React.ReactElement;
    render(cell({ row }));
    expect(
      screen.getByRole("checkbox", { name: "Selecionar Conta de luz" }),
    ).toBeInTheDocument();
  });

  it("mantém espaçamento suficiente entre os botões de ação para não sobrepor o hit-slop", () => {
    const row = makeRow(makeAccount());
    const cell = actionsColumn.cell as (ctx: { row: Row<AccountRow> }) => React.ReactElement;
    const { container } = render(cell({ row }));
    expect(container.firstChild).toHaveClass("gap-3");
  });
});
