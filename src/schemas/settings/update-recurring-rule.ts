import { z } from "zod";

export const updateRecurringRuleSchema = z.object({
  id: z.string().uuid("ID inválido"),
  endDate: z.string().nullable().optional(),
  recurrenceMonths: z.number().int().positive().nullable().optional(),
});
