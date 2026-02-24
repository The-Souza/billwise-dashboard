import { z } from "zod";

export const formSchema = z.object({
  email: z
    .string()
    .nonempty("Email é obrigatório")
    .email("Email inválido"),
  password: z
    .string()
    .nonempty("Senha é obrigatória")
});