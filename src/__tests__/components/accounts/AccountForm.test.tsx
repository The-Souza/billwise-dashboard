import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/utils/app-toast", () => ({
  appToast: { success: vi.fn(), error: vi.fn() },
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

import type { AccountDetail } from "@/actions/(user)/accounts/get-account-by-id";
import type { CategoryOption } from "@/actions/(user)/accounts/get-categories";
import { AccountForm } from "@/app/(protected)/(user)/accounts/_components/AccountForm";

const categories: CategoryOption[] = [
  { id: "cat-1", name: "Alimentação", icon: null, type: "expense" as CategoryOption["type"], isUtility: false },
  { id: "cat-2", name: "Salário", icon: null, type: "income" as CategoryOption["type"], isUtility: false },
];

const baseAccount: AccountDetail = {
  id: "acc-1",
  title: "Aluguel",
  amount: 1500,
  categoryId: "cat-1",
  categoryType: "expense" as AccountDetail["categoryType"],
  isUtility: false,
  dueDate: null,
  accountDate: "2026-05-01",
  status: "pending" as AccountDetail["status"],
  description: null,
  consumption: null,
  days: null,
  month: 5,
  year: 2026,
  isRecurring: false,
  recurringMonths: null,
  installmentGroupId: null,
  installments: [],
  siblings: [],
};

describe("AccountForm — modo criação", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza os campos principais", () => {
    render(<AccountForm categories={categories} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText("Título")).toBeInTheDocument();
    expect(screen.getByLabelText("Valor (R$)")).toBeInTheDocument();
    expect(screen.getByLabelText("Categoria")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Data da Conta")).toBeInTheDocument();
    expect(screen.getByLabelText("Vencimento")).toBeInTheDocument();
    expect(screen.getByLabelText("Descrição")).toBeInTheDocument();
  });

  it("renderiza seção de configurações com radio buttons de agendamento", () => {
    render(<AccountForm categories={categories} onSubmit={vi.fn()} />);
    expect(screen.getByRole("radio", { name: /normal/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /recorrente/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /parcelado/i })).toBeInTheDocument();
  });

  it("renderiza botões do rodapé", () => {
    render(<AccountForm categories={categories} onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /criar conta/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });

  it("radio 'Normal' vem selecionado por padrão", () => {
    render(<AccountForm categories={categories} onSubmit={vi.fn()} />);
    expect(screen.getByRole("radio", { name: /normal/i })).toBeChecked();
  });

  it("selecionar 'Recorrente' habilita o campo de duração", async () => {
    const user = userEvent.setup();
    render(<AccountForm categories={categories} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("radio", { name: /recorrente/i }));

    expect(screen.getByLabelText("Gerar próximos")).toBeEnabled();
  });

  it("selecionar 'Parcelado' habilita o campo de parcelas", async () => {
    const user = userEvent.setup();
    render(<AccountForm categories={categories} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("radio", { name: /parcelado/i }));

    expect(screen.getByLabelText(/quantidade de parcelas/i)).toBeEnabled();
  });

  it("cancelar navega para /accounts", async () => {
    const user = userEvent.setup();
    render(<AccountForm categories={categories} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /cancelar/i }));
    expect(mockPush).toHaveBeenCalledWith("/accounts");
  });
});

describe("AccountForm — modo edição (conta normal)", () => {
  it("exibe 'Salvar alterações' e não mostra seção de agendamento", () => {
    render(<AccountForm account={baseAccount} categories={categories} onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /salvar alterações/i })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: /normal/i })).not.toBeInTheDocument();
  });

  it("preenche o campo Título com o valor da conta", () => {
    render(<AccountForm account={baseAccount} categories={categories} onSubmit={vi.fn()} />);
    expect(screen.getByLabelText("Título")).toHaveValue("Aluguel");
  });
});

describe("AccountForm — modo edição (conta recorrente)", () => {
  const recurringAccount: AccountDetail = {
    ...baseAccount,
    isRecurring: true,
    recurringMonths: 12,
  };

  it("mostra seção de escopo com opções 'Apenas esta conta' e 'Esta e próximas recorrências'", () => {
    render(<AccountForm account={recurringAccount} categories={categories} onSubmit={vi.fn()} />);
    expect(screen.getByRole("radio", { name: /apenas esta conta/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /esta e próximas/i })).toBeInTheDocument();
  });

  it("mostra alerta ao selecionar escopo 'Apenas esta conta'", () => {
    render(<AccountForm account={recurringAccount} categories={categories} onSubmit={vi.fn()} />);
    expect(screen.getByText(/escopo 'apenas esta conta'/i)).toBeInTheDocument();
  });

  it("mostra alerta ao selecionar escopo 'Esta e próximas recorrências'", async () => {
    const user = userEvent.setup();
    render(<AccountForm account={recurringAccount} categories={categories} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole("radio", { name: /esta e próximas/i }));
    expect(screen.getByText(/as alterações serão aplicadas a esta conta e às próximas/i)).toBeInTheDocument();
  });
});

describe("AccountForm — modo edição (conta parcelada)", () => {
  const installmentAccount: AccountDetail = {
    ...baseAccount,
    installmentGroupId: "group-1",
    siblings: [
      { id: "sib-1", number: 1, month: 5, year: 2026, amount: 500, status: "pending" as AccountDetail["status"] },
      { id: "sib-2", number: 2, month: 6, year: 2026, amount: 500, status: "pending" as AccountDetail["status"] },
    ],
  };

  it("mostra opção 'Todas as parcelas' no escopo", () => {
    render(<AccountForm account={installmentAccount} categories={categories} onSubmit={vi.fn()} />);
    expect(screen.getByRole("radio", { name: /todas as parcelas/i })).toBeInTheDocument();
  });
});
