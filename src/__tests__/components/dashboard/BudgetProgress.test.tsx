import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { BudgetProgress } from "@/app/(protected)/(user)/dashboard/_components/BudgetProgress";

describe("BudgetProgress", () => {
  it("mostra a mensagem padrão de orçamento vazio quando o saldo não está negativo", () => {
    render(<BudgetProgress data={[]} label="agosto" isBalanceNegative={false} />);
    expect(
      screen.getByText("Nenhum orçamento de despesa definido."),
    ).toBeInTheDocument();
  });

  it("mostra uma mensagem contextual quando o saldo está negativo e não há orçamento de despesa", () => {
    render(<BudgetProgress data={[]} label="agosto" isBalanceNegative={true} />);
    expect(
      screen.getByText("Definir um orçamento pode ajudar a controlar isso."),
    ).toBeInTheDocument();
  });

  it("não muda a mensagem de metas de receita mesmo com saldo negativo", async () => {
    const user = userEvent.setup();
    render(<BudgetProgress data={[]} label="agosto" isBalanceNegative={true} />);

    await user.click(screen.getByRole("tab", { name: /metas/i }));

    expect(
      screen.getByText("Nenhuma meta de receita definida."),
    ).toBeInTheDocument();
  });
});
