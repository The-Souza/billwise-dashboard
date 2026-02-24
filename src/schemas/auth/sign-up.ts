import { z } from "zod";

export const formSchema = z
  .object({
    name: z.string().nonempty("Nome é obrigatório"),
    email: z.string().nonempty("Email é obrigatório").email("Email inválido").toLowerCase(),
    password: z
      .string()
      .nonempty("Senha é obrigatória")
      .min(6, "A senha deve conter no mínimo 6 caracteres")
      .regex(/(?=.*[A-Z])/, "A senha deve conter pelo menos uma letra maiúscula")
      .regex(/(?=.*[a-z])/, "A senha deve conter pelo menos uma letra minúscula")
      .regex(/(?=.*\d)/, "A senha deve conter pelo menos um número")
      .regex(/(?=.*[@$!%*?&])/, "A senha deve conter pelo menos um caractere especial"),
    confirmPassword: z.string().nonempty("Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });
