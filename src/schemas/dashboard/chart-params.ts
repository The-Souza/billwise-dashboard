import { monthYearSchema } from "@/schemas/shared/params";
import z from "zod";

export const MAX_CHART_PERIODS = 24;

export const chartParamsSchema = monthYearSchema.extend({
  periods: z.number().int().min(1).max(MAX_CHART_PERIODS),
});
