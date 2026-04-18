"use server";

import { category_type } from "@/generated/prisma/enums";
import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";

export type CategoryOption = {
  id: string;
  name: string;
  icon: string | null;
  type: category_type;
  isUtility: boolean;
};

type GetCategoriesResult =
  | { success: true; data: CategoryOption[] }
  | { success: false; error: string };

export async function getCategoriesAction(): Promise<GetCategoriesResult> {
  try {
    await requireAuth();

    const rows = await prisma.categories.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
        type: true,
        is_utility: true,
      },
      orderBy: { name: "asc" },
    });

    const data: CategoryOption[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      icon: row.icon ?? null,
      type: row.type,
      isUtility: row.is_utility ?? false,
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Error in getCategoriesAction:", error);
    return { success: false, error: "Erro ao buscar categorias" };
  }
}
