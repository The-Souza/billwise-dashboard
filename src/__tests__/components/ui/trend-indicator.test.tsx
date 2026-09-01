import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrendIndicator } from "@/components/ui/trend-indicator";

describe("TrendIndicator", () => {
  it("exibe mensagem de sem dados quando trend é null", () => {
    render(<TrendIndicator trend={null} isGood={true} />);
    expect(screen.getByText(/sem dados/i)).toBeInTheDocument();
  });

  it("exibe estado neutro (sem cor de alarme) quando trend é 0%, mesmo em métrica onde subir é ruim", () => {
    render(<TrendIndicator trend={0} isGood={false} />);
    const value = screen.getByText("0%");
    expect(value).not.toHaveClass("text-destructive");
    expect(value.parentElement).not.toHaveTextContent(/[↗↘]/);
  });

  it("marca alta como ruim (vermelho) quando isGood é false", () => {
    render(<TrendIndicator trend={12} isGood={false} />);
    expect(screen.getByText("12%")).toHaveClass("text-destructive");
  });

  it("marca alta como boa (neutra) quando isGood é true", () => {
    render(<TrendIndicator trend={12} isGood={true} />);
    expect(screen.getByText("12%")).not.toHaveClass("text-destructive");
  });

  it("marca queda como boa (neutra) quando isGood é false", () => {
    render(<TrendIndicator trend={-8} isGood={false} />);
    expect(screen.getByText("8%")).not.toHaveClass("text-destructive");
  });
});
