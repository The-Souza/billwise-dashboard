import { z } from "zod";

export const analyticsFiltersSchema = z
  .object({
    startMonth: z.number().int().min(1).max(12),
    startYear: z.number().int().min(2020),
    endMonth: z.number().int().min(1).max(12),
    endYear: z.number().int().min(2020),
    type: z.enum(["all", "income", "expense"]),
  })
  .superRefine((data, ctx) => {
    const startTotal = data.startYear * 12 + data.startMonth;
    const endTotal = data.endYear * 12 + data.endMonth;
    if (startTotal > endTotal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O período inicial deve ser anterior ou igual ao período final",
        path: ["startMonth"],
      });
    }
  });

export type AnalyticsFilters = z.infer<typeof analyticsFiltersSchema>;
export type AnalyticsType = "all" | "income" | "expense";
