import { z } from "zod";

export const accountFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "Título é obrigatório")
      .max(100, "Título muito longo"),

    amount: z
      .number({ message: "Valor é obrigatório" })
      .positive("Valor deve ser maior que zero"),

    categoryId: z.string().uuid("Categoria inválida").nullable().optional(),

    accountDate: z.string("Data da conta é obrigatória"),

    dueDate: z.string().nullable().optional(),

    status: z.enum(["pending", "paid", "overdue"], {
      message: "Status é obrigatório",
    }),

    description: z
      .string()
      .max(100, "Descrição muito longa")
      .nullable()
      .optional(),

    consumption: z
      .number("Consumo inválido")
      .positive("Consumo deve ser maior que zero")
      .nullable()
      .optional(),

    days: z
      .number("Dias inválido")
      .int("Dias deve ser inteiro")
      .positive("Dias deve ser maior que zero")
      .nullable()
      .optional(),

    scheduleType: z.enum(["none", "recurring", "installments"]),

    recurrenceMonths: z.number().int().positive().nullable().optional(),

    installments: z.number().int().min(2).nullable().optional(),

    editScope: z.enum(["single", "future", "all"]),
  })
  .superRefine((data, ctx) => {
    if (data.scheduleType === "recurring" && !data.categoryId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Categoria é obrigatória para contas recorrentes",
        path: ["categoryId"],
      });
    }

    if (data.scheduleType === "installments" && !data.installments) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe a quantidade de parcelas",
        path: ["installments"],
      });
    }
  });
