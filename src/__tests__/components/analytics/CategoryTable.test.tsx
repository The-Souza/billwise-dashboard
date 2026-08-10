import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { CategoryBreakdownItem } from "@/actions/(user)/analytics/get-category-breakdown";
import { CategoryTable } from "@/app/(protected)/(user)/analytics/_components/CategoryTable";

const data: CategoryBreakdownItem[] = [
  {
    categoryId: "cat-1",
    categoryName: "Moradia",
    categoryIcon: null,
    type: "expense",
    total: 1000,
    count: 3,
    average: 333.33,
    percentage: 60,
  },
  {
    categoryId: "cat-2",
    categoryName: "Alimentação",
    categoryIcon: null,
    type: "expense",
    total: 500,
    count: 5,
    average: 100,
    percentage: 40,
  },
];

describe("CategoryTable", () => {
  it("cabeçalhos ordenáveis são botões reais, alcançáveis por teclado", () => {
    render(<CategoryTable data={data} />);
    const header = screen.getByRole("button", { name: /categoria/i });
    expect(header.tagName).toBe("BUTTON");
  });

  it("reordena a tabela ao ativar o cabeçalho pelo teclado (Enter)", async () => {
    const user = userEvent.setup();
    render(<CategoryTable data={data} />);

    const header = screen.getByRole("button", { name: /categoria/i });
    header.focus();
    expect(header).toHaveFocus();

    // primeiro Enter troca a coluna (ordena desc); segundo Enter alterna para asc
    await user.keyboard("{Enter}");
    await user.keyboard("{Enter}");

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Alimentação");
  });

  it("reordena a tabela ao clicar no cabeçalho", async () => {
    const user = userEvent.setup();
    render(<CategoryTable data={data} />);

    const header = screen.getByRole("button", { name: /categoria/i });
    // primeiro clique troca a coluna (ordena desc); segundo clique alterna para asc
    await user.click(header);
    await user.click(header);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Alimentação");
  });
});
