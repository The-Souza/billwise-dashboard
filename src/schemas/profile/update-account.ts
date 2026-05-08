import z from "zod";

export const updateAccountSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  email: z.string().email("Email inválido").toLowerCase(),
});
