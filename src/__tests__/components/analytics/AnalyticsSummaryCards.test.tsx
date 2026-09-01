import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { AnalyticsSummary } from "@/actions/(user)/analytics/get-analytics-summary";
import { AnalyticsSummaryCards } from "@/app/(protected)/(user)/analytics/_components/AnalyticsSummaryCards";

const data: AnalyticsSummary = {
  totalIncome: 1000,
  totalExpense: 500,
  balance: 500,
  avgMonthlyExpense: 250,
  avgMonthlyIncome: 500,
  monthCount: 2,
};

describe("AnalyticsSummaryCards", () => {
  it("mostra skeleton enquanto carrega", () => {
    const { container } = render(
      <AnalyticsSummaryCards isLoading data={undefined} />,
    );
    expect(container.querySelectorAll(".animate-pulse").length).toBe(4);
  });

  it("mostra os valores quando os dados chegam", () => {
    render(<AnalyticsSummaryCards data={data} isLoading={false} />);
    expect(screen.getByText(/R\$\s?1\.000,00/)).toBeInTheDocument();
  });

  it("mostra estado de erro com botão de tentar novamente em vez de skeleton infinito", () => {
    render(
      <AnalyticsSummaryCards
        data={undefined}
        isLoading={false}
        isError
        onRetry={vi.fn()}
      />,
    );
    expect(
      screen.getByText(/não foi possível carregar o resumo do período/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /tentar novamente/i }),
    ).toBeInTheDocument();
  });

  it("chama onRetry ao clicar em tentar novamente", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
      <AnalyticsSummaryCards
        data={undefined}
        isLoading={false}
        isError
        onRetry={onRetry}
      />,
    );

    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
