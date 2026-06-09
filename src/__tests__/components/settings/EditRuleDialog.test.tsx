import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/actions/(user)/settings/update-recurring-rule", () => ({
  updateRecurringRuleAction: vi.fn(),
}));

vi.mock("@/utils/app-toast", () => ({
  appToast: { success: vi.fn(), error: vi.fn() },
}));

import type { RecurringRuleRow } from "@/actions/(user)/settings/get-recurring-rules";
import { updateRecurringRuleAction } from "@/actions/(user)/settings/update-recurring-rule";
import { EditRuleDialog } from "@/app/(protected)/(user)//settings/_components/EditRuleDialog";
import { appToast } from "@/utils/app-toast";

const mockUpdate = vi.mocked(updateRecurringRuleAction);
const mockToast = vi.mocked(appToast);

const rule: RecurringRuleRow = {
  id: "rule-1",
  title: "Netflix",
  amount: 55,
  startDate: "2024-01-01",
  recurrenceMonths: 6,
  categoryName: "Lazer",
  categoryIcon: null,
  categoryType: "expense" as RecurringRuleRow["categoryType"],
  frequency: "",
  endDate: null,
};

describe("EditRuleDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("não renderiza quando rule é null", () => {
    render(<EditRuleDialog rule={null} onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renderiza com título e nome da regra", () => {
    render(<EditRuleDialog rule={rule} onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByText(/editar regra recorrente/i)).toBeInTheDocument();
    expect(screen.getByText(/netflix/i)).toBeInTheDocument();
  });

  it("inicializa com o campo de duração preenchido", () => {
    render(<EditRuleDialog rule={rule} onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByRole("spinbutton")).toHaveValue(6);
  });

  it("alterna unidade entre meses e anos ao clicar no switch", async () => {
    const user = userEvent.setup();
    render(<EditRuleDialog rule={rule} onClose={vi.fn()} onSaved={vi.fn()} />);

    const switchEl = screen.getByRole("switch");
    expect(switchEl).toHaveAttribute("aria-checked", "false");

    await user.click(switchEl);
    expect(switchEl).toHaveAttribute("aria-checked", "true");
  });

  it("chama onClose ao clicar em Cancelar", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<EditRuleDialog rule={rule} onClose={onClose} onSaved={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("chama updateRecurringRuleAction e onSaved em caso de sucesso", async () => {
    mockUpdate.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();
    const onSaved = vi.fn();
    render(<EditRuleDialog rule={rule} onClose={vi.fn()} onSaved={onSaved} />);

    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith(
        "Regra atualizada com sucesso.",
      );
      expect(onSaved).toHaveBeenCalledOnce();
    });
  });

  it("exibe toast de erro quando action retorna falha", async () => {
    mockUpdate.mockResolvedValueOnce({
      success: false,
      error: "Erro ao salvar",
    });
    const user = userEvent.setup();
    render(<EditRuleDialog rule={rule} onClose={vi.fn()} onSaved={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /salvar/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Erro ao salvar");
    });
  });

  it("botão 'Sem prazo definido' limpa o campo de duração", async () => {
    const user = userEvent.setup();
    render(<EditRuleDialog rule={rule} onClose={vi.fn()} onSaved={vi.fn()} />);

    await user.click(
      screen.getByRole("button", { name: /sem prazo definido/i }),
    );
    expect(screen.getByRole("spinbutton")).toHaveValue(null);
  });
});
