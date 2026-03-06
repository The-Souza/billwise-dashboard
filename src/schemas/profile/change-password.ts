import z from "zod";

export const formSchema = z
  .object({
    currentPassword: z.string().nonempty("Senha é obrigatória"),
    newPassword: z.string().nonempty("Senha é obrigatória"),
    confirmNewPassword: z
      .string()
      .nonempty("Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As senhas não coincidem",
    path: ["confirmNewPassword"],
  });
