import { z } from "zod";

export const formSchema = z.object({
  email: z
    .string({ message: "Email é obrigatório" })
    .nonempty("Email é obrigatório")
    .email("Email inválido"),
  password: z
    .string({ message: "Senha é obrigatória" })
    .nonempty("Senha é obrigatória")
});