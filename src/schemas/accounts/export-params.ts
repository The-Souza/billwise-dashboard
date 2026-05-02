import { z } from "zod";

export const exportParamsSchema = z.object({
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2020).optional(),
});

export type ExportParamsInput = z.input<typeof exportParamsSchema>;
