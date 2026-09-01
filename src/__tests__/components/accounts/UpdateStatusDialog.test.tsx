import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { AccountRow } from "@/actions/(user)/accounts/get-accounts";
import { UpdateStatusDialog } from "@/app/(protected)/(user)/accounts/_components/UpdateStatusDialog";

const account: AccountRow = {
  id: "1",
  title: "Aluguel",
  category: "Moradia",
  categoryIcon: null,
  categoryType: "expense",
  amount: 1500,
  dueDate: null,
  status: "pending",
  isRecurring: false,
  installments: null,
};

describe("UpdateStatusDialog", () => {
  it("não renderiza conteúdo quando fechado", () => {
    render(
      <UpdateStatusDialog
        open={false}
        accounts={[account]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("chama onConfirm com o status selecionado ao clicar em Confirmar", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <UpdateStatusDialog
        open={true}
        accounts={[account]}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^confirmar$/i }));
    expect(onConfirm).toHaveBeenCalledWith("paid");
  });

  it("não chama onCancel ao clicar em Confirmar (dialog não fecha antes da ação assíncrona resolver)", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <UpdateStatusDialog
        open={true}
        accounts={[account]}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^confirmar$/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("desabilita botões quando isUpdating é true", () => {
    render(
      <UpdateStatusDialog
        open={true}
        accounts={[account]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isUpdating={true}
      />,
    );
    expect(
      screen.getByRole("button", { name: /atualizando/i }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled();
  });
});
