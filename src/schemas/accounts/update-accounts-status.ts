import { account_status } from "@/generated/prisma/enums";
import z from "zod";

export const updateAccountsStatusSchema = z.object({
  ids: z
    .array(z.string().uuid("ID inválido"))
    .min(1, "Nenhuma conta selecionada")
    .max(100, "Limite de 100 contas por operação"),
  status: z.nativeEnum(account_status, { message: "Status inválido" }),
});
