import z from "zod";

export const markReadIdsSchema = z
  .array(z.string().uuid())
  .max(100, "Limite de 100 notificações por operação")
  .optional();
