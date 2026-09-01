import { z } from "zod";

export const budgetFormSchema = z.object({
  categoryId: z.string().uuid("Categoria inválida"),
  limitAmount: z
    .number({ message: "Valor é obrigatório" })
    .positive("Valor deve ser maior que zero")
    .max(1_000_000, "Valor muito alto"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
});
