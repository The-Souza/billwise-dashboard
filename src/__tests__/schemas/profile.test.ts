import { formSchema as forgotPasswordSchema } from "@/schemas/auth/forgot-password";
import {
  chartParamsSchema,
  MAX_CHART_PERIODS,
} from "@/schemas/dashboard/chart-params";
import { formSchema as changePasswordSchema } from "@/schemas/profile/change-password";
import { updateAccountSchema } from "@/schemas/profile/update-account";
import { describe, expect, it } from "vitest";

describe("changePasswordSchema", () => {
  const valid = {
    currentPassword: "OldPass1@",
    newPassword: "NewPass1@",
    confirmNewPassword: "NewPass1@",
  };

  it("aceita dados válidos", () => {
    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
  });

  it("rejeita currentPassword vazia", () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      currentPassword: "",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Senha é obrigatória");
  });

  it("rejeita newPassword sem letra maiúscula", () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      newPassword: "newpass1@",
      confirmNewPassword: "newpass1@",
    });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((i) => i.message);
    expect(messages).toContain(
      "A senha deve conter pelo menos uma letra maiúscula",
    );
  });

  it("rejeita newPassword sem número", () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      newPassword: "NewPass@@",
      confirmNewPassword: "NewPass@@",
    });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((i) => i.message);
    expect(messages).toContain("A senha deve conter pelo menos um número");
  });

  it("rejeita newPassword sem caractere especial", () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      newPassword: "NewPass12",
      confirmNewPassword: "NewPass12",
    });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((i) => i.message);
    expect(messages).toContain(
      "A senha deve conter pelo menos um caractere especial",
    );
  });

  it("rejeita confirmação diferente da nova senha", () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      confirmNewPassword: "OutraSenha1@",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("As senhas não coincidem");
  });
});

describe("updateAccountSchema (perfil)", () => {
  it("aceita dados válidos", () => {
    expect(
      updateAccountSchema.safeParse({
        name: "João Silva",
        email: "joao@example.com",
      }).success,
    ).toBe(true);
  });

  it("normaliza email para lowercase", () => {
    const result = updateAccountSchema.safeParse({
      name: "João",
      email: "JOAO@EXAMPLE.COM",
    });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("joao@example.com");
  });

  it("rejeita nome vazio", () => {
    const result = updateAccountSchema.safeParse({
      name: "",
      email: "joao@example.com",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Nome é obrigatório");
  });

  it("rejeita email inválido", () => {
    const result = updateAccountSchema.safeParse({
      name: "João",
      email: "nao-é-email",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Email inválido");
  });
});

describe("forgotPasswordSchema", () => {
  it("aceita email válido", () => {
    expect(
      forgotPasswordSchema.safeParse({ email: "user@example.com" }).success,
    ).toBe(true);
  });

  it("rejeita email vazio", () => {
    const result = forgotPasswordSchema.safeParse({ email: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Email é obrigatório");
  });

  it("rejeita email inválido", () => {
    const result = forgotPasswordSchema.safeParse({ email: "nao-é-email" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Email inválido");
  });
});

describe("chartParamsSchema", () => {
  it("aceita parâmetros válidos", () => {
    expect(
      chartParamsSchema.safeParse({ month: 4, year: 2026, periods: 6 }).success,
    ).toBe(true);
  });

  it(`aceita periods no máximo (${MAX_CHART_PERIODS})`, () => {
    expect(
      chartParamsSchema.safeParse({
        month: 1,
        year: 2026,
        periods: MAX_CHART_PERIODS,
      }).success,
    ).toBe(true);
  });

  it("rejeita periods zero", () => {
    expect(
      chartParamsSchema.safeParse({ month: 1, year: 2026, periods: 0 }).success,
    ).toBe(false);
  });

  it(`rejeita periods acima do máximo (${MAX_CHART_PERIODS})`, () => {
    expect(
      chartParamsSchema.safeParse({
        month: 1,
        year: 2026,
        periods: MAX_CHART_PERIODS + 1,
      }).success,
    ).toBe(false);
  });

  it("rejeita periods não-inteiro", () => {
    expect(
      chartParamsSchema.safeParse({ month: 1, year: 2026, periods: 1.5 })
        .success,
    ).toBe(false);
  });

  it("herda validação de mês do monthYearSchema", () => {
    expect(
      chartParamsSchema.safeParse({ month: 13, year: 2026, periods: 6 })
        .success,
    ).toBe(false);
  });
});
