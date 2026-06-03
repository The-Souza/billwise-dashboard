"use server";

import { requireWorkspace } from "@/lib/auth/workspace";
import { prisma } from "@/lib/prisma/client";
import { exportParamsSchema } from "@/schemas/accounts/export-params";
import type { ExportParamsInput } from "@/schemas/accounts/export-params";
import * as XLSX from "xlsx";

export type ExportAccountsResult =
  | { success: true; data: string; filename: string }
  | { success: false; error: string };

type SpreadsheetRow = (string | number | null)[];

export async function exportAccountsAction(
  params: ExportParamsInput = {},
): Promise<ExportAccountsResult> {
  const parsed = exportParamsSchema.safeParse(params);
  if (!parsed.success) {
    return { success: false, error: "Parâmetros inválidos" };
  }

  try {
    const ctx = await requireWorkspace();
    const { month, year } = parsed.data;

    const rows = await prisma.accounts.findMany({
      where: {
        workspace_id: ctx.workspaceId,
        ...(month !== undefined && { month }),
        ...(year !== undefined && { year }),
      },
      include: {
        categories: { select: { name: true, type: true } },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }, { created_at: "desc" }],
    });

    const header: SpreadsheetRow = [
      "Título",
      "Categoria",
      "Tipo",
      "Status",
      "Data da conta",
      "Mês",
      "Ano",
      "Data de vencimento",
      "Data de pagamento",
      "Consumo",
      "Dias",
      "Valor",
      "Descrição",
    ];

    const dataRows: SpreadsheetRow[] = rows.map((row) => [
      row.title,
      row.categories?.name ?? "",
      row.categories?.type === "income" ? "Receita" : "Despesa",
      row.status ?? "pending",
      row.account_date.toISOString().substring(0, 10),
      row.month,
      row.year,
      row.due_date ? row.due_date.toISOString().substring(0, 10) : "",
      row.status === "paid" && row.paid_at ? row.paid_at.toISOString().substring(0, 10) : "",
      row.consumption !== null && row.consumption !== undefined
        ? Number(row.consumption)
        : null,
      row.days ?? null,
      Number(row.amount),
      row.description ?? "",
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([header, ...dataRows]);
    ws["!cols"] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 14 },
      { wch: 6 },
      { wch: 6 },
      { wch: 18 },
      { wch: 18 },
      { wch: 10 },
      { wch: 6 },
      { wch: 10 },
      { wch: 35 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Contas");

    const label =
      month && year ? `${String(month).padStart(2, "0")}-${year}` : "todos";
    const base64 = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

    return { success: true, data: base64, filename: `contas-${label}.xlsx` };
  } catch (error) {
    console.error("Error in exportAccountsAction:", error);
    return { success: false, error: "Erro ao exportar contas" };
  }
}
