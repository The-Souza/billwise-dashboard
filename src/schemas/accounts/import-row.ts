import { normalizeStatus } from "@/utils/account-import";
import { z } from "zod";

export const importRowSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  categoryName: z.string().nullable().optional(),
  categoryType: z.string().nullable().optional(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020),
  accountDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
  status: z.string().default("pending").transform(normalizeStatus),
  consumption: z.number().positive().nullable().optional(),
  days: z.number().int().positive().nullable().optional(),
  description: z.string().nullable().optional(),
});

export type ImportRowInput = z.input<typeof importRowSchema>;
export type ImportRow = z.output<typeof importRowSchema>;
