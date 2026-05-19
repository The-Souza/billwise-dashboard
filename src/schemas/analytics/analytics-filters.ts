import { z } from "zod";

export const analyticsFiltersSchema = z.object({
  startMonth: z.number().int().min(1).max(12),
  startYear: z.number().int().min(2020),
  endMonth: z.number().int().min(1).max(12),
  endYear: z.number().int().min(2020),
  type: z.enum(["all", "income", "expense"]),
});

export type AnalyticsFilters = z.infer<typeof analyticsFiltersSchema>;
export type AnalyticsType = "all" | "income" | "expense";
