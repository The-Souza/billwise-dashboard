import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/actions/(user)/settings/delete-recurring-rule", () => ({
  deleteRecurringRuleAction: vi.fn(),
}));

vi.mock("@/utils/app-toast", () => ({
  appToast: { success: vi.fn(), error: vi.fn() },
}));

import { deleteRecurringRuleAction } from "@/actions/(user)/settings/delete-recurring-rule";
import type { RecurringRuleRow } from "@/actions/(user)/settings/get-recurring-rules";
import { DeleteRuleAlertDialog } from "@/app/(protected)/(user)//settings/_components/DeleteRuleAlertDialog";
import { appToast } from "@/utils/app-toast";

const mockDelete = vi.mocked(deleteRecurringRuleAction);
const mockToast = vi.mocked(appToast);

const rule: RecurringRuleRow = {
  id: "rule-1",
  title: "Aluguel",
  amount: 1200,
  startDate: "2024-01-01",
  recurrenceMonths: 12,
  categoryName: "Moradia",
  categoryIcon: null,
  categoryType: "expense" as RecurringRuleRow["categoryType"],
  frequency: "",
  endDate: null,
};

describe("DeleteRuleAlertDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("não renderiza conteúdo quando rule é null", () => {
    render(
      <DeleteRuleAlertDialog
        rule={null}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("exibe título com nome da regra quando aberto", () => {
    render(
      <DeleteRuleAlertDialog
        rule={rule}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );
    expect(screen.getByRole("heading")).toHaveTextContent(/aluguel/i);
  });

  it("chama onClose ao clicar em Cancelar", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <DeleteRuleAlertDialog
        rule={rule}
        onClose={onClose}
        onDeleted={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("chama deleteRecurringRuleAction e onDeleted em caso de sucesso", async () => {
    mockDelete.mockResolvedValueOnce({ success: true });
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    render(
      <DeleteRuleAlertDialog
        rule={rule}
        onClose={vi.fn()}
        onDeleted={onDeleted}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^excluir$/i }));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith("rule-1");
      expect(mockToast.success).toHaveBeenCalledWith(
        "Regra excluída com sucesso.",
      );
      expect(onDeleted).toHaveBeenCalledOnce();
    });
  });

  it("exibe toast de erro quando action retorna falha", async () => {
    mockDelete.mockResolvedValueOnce({
      success: false,
      error: "Erro ao excluir",
    });
    const user = userEvent.setup();
    render(
      <DeleteRuleAlertDialog
        rule={rule}
        onClose={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^excluir$/i }));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Erro ao excluir");
    });
  });
});
