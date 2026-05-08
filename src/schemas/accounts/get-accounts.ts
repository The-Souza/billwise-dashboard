import { account_status } from "@/generated/prisma/enums";
import z from "zod";

export const getAccountsFiltersSchema = z.object({
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  status: z.nativeEnum(account_status).optional(),
  categoryId: z.string().uuid().optional(),
  title: z.string().max(200).optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
});
