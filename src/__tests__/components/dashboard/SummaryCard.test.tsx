import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { MonthlySummary } from "@/actions/(user)/dashboard/get-summary";
import { SummaryCard } from "@/app/(protected)/(user)/dashboard/_components/SummaryCard";

function makeData(overrides: Partial<MonthlySummary> = {}): MonthlySummary {
  return {
    balance: 1000,
    totalIncome: 3000,
    totalExpense: 2000,
    balanceTrend: 5,
    incomeTrend: 5,
    expenseTrend: 5,
    ...overrides,
  };
}

describe("SummaryCard", () => {
  it("destaca o saldo negativo com a cor de alarme", () => {
    render(<SummaryCard data={makeData({ balance: -500 })} />);
    expect(screen.getByText(/-R\$\s?500,00/)).toHaveClass("text-destructive");
  });

  it("não destaca o saldo positivo com a cor de alarme", () => {
    render(<SummaryCard data={makeData({ balance: 500 })} />);
    expect(screen.getByText(/R\$\s?500,00/)).not.toHaveClass(
      "text-destructive",
    );
  });
});
