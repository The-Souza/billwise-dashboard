"use server";

import { requireAuth } from "@/lib/auth/guards";
import { prisma } from "@/lib/prisma/client";
import * as XLSX from "xlsx";

export type GetImportTemplateResult =
  | { success: true; data: string; filename: string }
  | { success: false; error: string };

const DATA_COLS = [
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

// col 0=Título 1=Categoria 2=Tipo 3=Status 4=Data da conta 5=Mês 6=Ano
// col 7=Data de vencimento 8=Data de pagamento 9=Consumo 10=Dias 11=Valor 12=Descrição
type SpreadsheetRow = (string | number | null)[];

const EXAMPLES: SpreadsheetRow[] = [
  [
    "Conta de luz",
    "Energia",
    "Despesa",
    "Pago",
    "01/04/2026",
    4,
    2026,
    "15/04/2026",
    "15/04/2026",
    120.5,
    30,
    185.0,
    "Referência 04/2026",
  ],
  [
    "Salário",
    "Salário",
    "Receita",
    "Pago",
    "01/04/2026",
    4,
    2026,
    "",
    "01/04/2026",
    "",
    "",
    5500.0,
    "",
  ],
  [
    "Netflix",
    "Assinaturas",
    "Despesa",
    "Pendente",
    "01/04/2026",
    4,
    2026,
    "20/04/2026",
    "",
    "",
    "",
    55.9,
    "",
  ],
  [
    "Ração do cachorro",
    "Pets",
    "Despesa",
    "Pago",
    "05/04/2026",
    4,
    2026,
    "",
    "05/04/2026",
    "",
    "",
    120.0,
    "Ração + petisco",
  ],
];

export async function getImportTemplateAction(): Promise<GetImportTemplateResult> {
  try {
    await requireAuth();

    const categories = await prisma.categories.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: { name: true, type: true, is_utility: true },
    });

    const wb = XLSX.utils.book_new();

    // ── Aba 1: Preencha aqui ──────────────────────────────────────
    const ws1 = XLSX.utils.aoa_to_sheet([DATA_COLS, ...EXAMPLES]);
    ws1["!cols"] = [
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
    XLSX.utils.book_append_sheet(wb, ws1, "Preencha aqui");

    // ── Aba 2: Categorias ─────────────────────────────────────────
    const catRows: SpreadsheetRow[] = [
      ["Categoria", "Tipo", "Utilitária"],
      ...categories.map((cat) => [
        cat.name,
        cat.type === "income" ? "Receita" : "Despesa",
        cat.is_utility ? "Sim *" : "Não",
      ]),
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(catRows);
    ws2["!cols"] = [{ wch: 22 }, { wch: 10 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Categorias");

    // ── Aba 3: Instruções ─────────────────────────────────────────
    const instrRows: SpreadsheetRow[] = [
      ["Campo", "Obrigatório", "Regra"],
      ["Título", "Sim", "Texto livre"],
      ["Categoria", "Sim", "Exatamente como listado na aba Categorias"],
      ["Tipo", "Sim", "Despesa ou Receita"],
      ["Status", "Sim", "Pago · Pendente · Vencido"],
      [
        "Data da conta",
        "Sim",
        "DD/MM/YYYY (ex: 01/04/2026) ou YYYY-MM-DD (ex: 2026-04-01)",
      ],
      ["Mês", "Sim", "Número inteiro (ex: 4 para abril)"],
      ["Ano", "Sim", "Número inteiro (ex: 2026)"],
      [
        "Data de vencimento",
        "Não",
        "DD/MM/YYYY ou YYYY-MM-DD — deixar em branco se não houver",
      ],
      [
        "Data de pagamento",
        "Sim*",
        "Obrigatório quando Status = Pago. DD/MM/YYYY ou YYYY-MM-DD. Se omitido, usa o 1º dia do mês.",
      ],
      [
        "Consumo",
        "Não",
        "Somente para categorias marcadas com * na aba Categorias",
      ],
      [
        "Dias",
        "Não",
        "Somente para categorias marcadas com * na aba Categorias",
      ],
      ["Valor", "Sim", "Número decimal. Use ponto como separador (ex: 185.00)"],
      ["Descrição", "Não", "Texto livre opcional para anotações"],
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(instrRows);
    ws3["!cols"] = [{ wch: 22 }, { wch: 13 }, { wch: 55 }];
    XLSX.utils.book_append_sheet(wb, ws3, "Instruções");

    const base64 = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    return {
      success: true,
      data: base64,
      filename: "template-importacao.xlsx",
    };
  } catch (error) {
    console.error("Error in getImportTemplateAction:", error);
    return { success: false, error: "Erro ao gerar template" };
  }
}
