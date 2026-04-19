import { formSchema as signInSchema } from "@/schemas/auth/sign-in";
import { formSchema as signUpSchema } from "@/schemas/auth/sign-up";
import { describe, expect, it } from "vitest";

describe("signInSchema", () => {
  it("aceita credenciais válidas", () => {
    const result = signInSchema.safeParse({
      email: "user@example.com",
      password: "Secret1@",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita email vazio", () => {
    const result = signInSchema.safeParse({ email: "", password: "Secret1@" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Email é obrigatório");
  });

  it("rejeita email com formato inválido", () => {
    const result = signInSchema.safeParse({
      email: "nao-é-email",
      password: "Secret1@",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Email inválido");
  });

  it("rejeita senha vazia", () => {
    const result = signInSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Senha é obrigatória");
  });
});

describe("signUpSchema", () => {
  const valid = {
    name: "João Silva",
    email: "joao@example.com",
    password: "Senha1@forte",
    confirmPassword: "Senha1@forte",
  };

  it("aceita dados válidos", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("normaliza email para lowercase", () => {
    const result = signUpSchema.safeParse({
      ...valid,
      email: "JOAO@EXAMPLE.COM",
    });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("joao@example.com");
  });

  it("rejeita senha sem letra maiúscula", () => {
    const result = signUpSchema.safeParse({
      ...valid,
      password: "senha1@forte",
      confirmPassword: "senha1@forte",
    });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((i) => i.message);
    expect(messages).toContain(
      "A senha deve conter pelo menos uma letra maiúscula",
    );
  });

  it("rejeita senha sem número", () => {
    const result = signUpSchema.safeParse({
      ...valid,
      password: "SenhaForte@",
      confirmPassword: "SenhaForte@",
    });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((i) => i.message);
    expect(messages).toContain("A senha deve conter pelo menos um número");
  });

  it("rejeita senha sem caractere especial", () => {
    const result = signUpSchema.safeParse({
      ...valid,
      password: "SenhaForte1",
      confirmPassword: "SenhaForte1",
    });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((i) => i.message);
    expect(messages).toContain(
      "A senha deve conter pelo menos um caractere especial",
    );
  });

  it("rejeita confirmação de senha diferente", () => {
    const result = signUpSchema.safeParse({
      ...valid,
      confirmPassword: "SenhaDiferente1@",
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("As senhas não coincidem");
  });

  it("rejeita nome vazio", () => {
    const result = signUpSchema.safeParse({ ...valid, name: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("Nome é obrigatório");
  });
});
