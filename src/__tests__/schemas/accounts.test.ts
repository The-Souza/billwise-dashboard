import { accountFormSchema } from "@/schemas/accounts/account-form";
import { deleteAccountsSchema } from "@/schemas/accounts/delete-accounts";
import { describe, expect, it } from "vitest";

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("accountFormSchema", () => {
  const base = {
    title: "Conta de luz",
    amount: 150.5,
    accountDate: "2026-04-01",
    status: "pending" as const,
    scheduleType: "none" as const,
    editScope: "single" as const,
  };

  it("aceita conta válida simples", () => {
    expect(accountFormSchema.safeParse(base).success).toBe(true);
  });

  it("rejeita título vazio", () => {
    const result = accountFormSchema.safeParse({ ...base, title: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Título é obrigatório");
  });

  it("rejeita título muito longo (>100 chars)", () => {
    const result = accountFormSchema.safeParse({
      ...base,
      title: "a".repeat(101),
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Título muito longo");
  });

  it("rejeita amount zero", () => {
    const result = accountFormSchema.safeParse({ ...base, amount: 0 });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Valor deve ser maior que zero",
    );
  });

  it("rejeita amount negativo", () => {
    const result = accountFormSchema.safeParse({ ...base, amount: -10 });
    expect(result.success).toBe(false);
  });

  it("rejeita status inválido", () => {
    const result = accountFormSchema.safeParse({
      ...base,
      status: "unknown" as never,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita recorrente sem categoria", () => {
    const result = accountFormSchema.safeParse({
      ...base,
      scheduleType: "recurring",
      categoryId: null,
    });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((i) => i.message);
    expect(messages).toContain(
      "Categoria é obrigatória para contas recorrentes",
    );
  });

  it("aceita recorrente com categoria válida", () => {
    const result = accountFormSchema.safeParse({
      ...base,
      scheduleType: "recurring",
      categoryId: VALID_UUID,
      recurrenceMonths: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita parcelado sem informar parcelas", () => {
    const result = accountFormSchema.safeParse({
      ...base,
      scheduleType: "installments",
      installments: null,
    });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((i) => i.message);
    expect(messages).toContain("Informe a quantidade de parcelas");
  });

  it("aceita parcelado com parcelas válidas", () => {
    const result = accountFormSchema.safeParse({
      ...base,
      scheduleType: "installments",
      installments: 3,
    });
    expect(result.success).toBe(true);
  });
});

describe("deleteAccountsSchema", () => {
  it("aceita array de UUIDs válidos", () => {
    expect(
      deleteAccountsSchema.safeParse([VALID_UUID]).success,
    ).toBe(true);
  });

  it("rejeita array vazio", () => {
    const result = deleteAccountsSchema.safeParse([]);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Nenhuma conta selecionada");
  });

  it("rejeita UUID inválido no array", () => {
    const result = deleteAccountsSchema.safeParse(["nao-é-uuid"]);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("ID inválido");
  });

  it("rejeita array com mais de 100 itens", () => {
    const ids = Array.from({ length: 101 }, () => VALID_UUID);
    const result = deleteAccountsSchema.safeParse(ids);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Limite de 100 contas por operação",
    );
  });
});
