import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DeleteAccountDialog } from "@/app/(protected)/(user)/accounts/_components/DeleteAccountDialog";
import type { AccountRow } from "@/actions/(user)/accounts/get-accounts";

const baseAccount: AccountRow = {
  id: "1",
  title: "Conta de Luz",
  category: "Energia",
  categoryIcon: null,
  categoryType: "expense" as AccountRow["categoryType"],
  amount: 150,
  dueDate: null,
  status: "pending" as AccountRow["status"],
  isRecurring: false,
  installments: null,
};

describe("DeleteAccountDialog", () => {
  it("não renderiza conteúdo quando fechado", () => {
    render(
      <DeleteAccountDialog
        open={false}
        accounts={[baseAccount]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("exibe título com nome da conta ao excluir uma única conta", () => {
    render(
      <DeleteAccountDialog
        open={true}
        accounts={[baseAccount]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText(/excluir "Conta de Luz"/i)).toBeInTheDocument();
  });

  it("exibe título com contagem ao excluir múltiplas contas", () => {
    const accounts = [
      baseAccount,
      { ...baseAccount, id: "2", title: "Internet" },
    ];
    render(
      <DeleteAccountDialog
        open={true}
        accounts={accounts}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText(/excluir 2 contas/i)).toBeInTheDocument();
  });

  it("exibe aviso de parcelas quando conta tem parcelas", () => {
    const account = { ...baseAccount, installments: { current: 1, total: 12 } };
    render(
      <DeleteAccountDialog
        open={true}
        accounts={[account]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText(/parcelas/i)).toBeInTheDocument();
  });

  it("exibe aviso de recorrência quando conta é recorrente", () => {
    const account = { ...baseAccount, isRecurring: true };
    render(
      <DeleteAccountDialog
        open={true}
        accounts={[account]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText(/recorrente/i)).toBeInTheDocument();
  });

  it("chama onConfirm ao clicar em Excluir", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <DeleteAccountDialog
        open={true}
        accounts={[baseAccount]}
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
      <DeleteAccountDialog
        open={true}
        accounts={[baseAccount]}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("desabilita botões quando isDeleting é true", () => {
    render(
      <DeleteAccountDialog
        open={true}
        accounts={[baseAccount]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isDeleting={true}
      />,
    );
    expect(screen.getByRole("button", { name: /excluindo/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled();
  });
});
