import z from "zod";

export const deleteAccountsSchema = z
  .array(z.string().uuid("ID inválido"))
  .min(1, "Nenhuma conta selecionada")
  .max(100, "Limite de 100 contas por operação");
