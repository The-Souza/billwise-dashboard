import type { ImportRowInput } from "@/schemas/accounts/import-row";

export function normalizeDate(v: string | null | undefined): string | null {
  if (!v) return null;
  const trimmed = v.trim();
  const brMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.substring(0, 10);
  return null;
}

export function normalizeStatus(v: string): "pending" | "paid" | "overdue" {
  const map: Record<string, "pending" | "paid" | "overdue"> = {
    pago: "paid",
    pendente: "pending",
    vencido: "overdue",
    paid: "paid",
    pending: "pending",
    overdue: "overdue",
  };
  return map[v.toLowerCase()] ?? "pending";
}

export function normalizeType(v: string | null | undefined): "income" | "expense" {
  if (!v) return "expense";
  const lower = v.toLowerCase();
  if (lower === "receita" || lower === "income") return "income";
  return "expense";
}

export function formatCellDate(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().substring(0, 10);
  if (typeof value === "string") return value.substring(0, 10) || null;
  return null;
}

export async function parseXlsxFile(file: File): Promise<ImportRowInput[]> {
  const { read, utils } = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const wb = read(buffer, { type: "array", cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "" });

  return rows
    .slice(1)
    .filter((row) => Array.isArray(row) && row[0])
    .map((row) => ({
      title: String((row as unknown[])[0] ?? ""),
      categoryName: String((row as unknown[])[1] ?? "") || null,
      categoryType: String((row as unknown[])[2] ?? "") || null,
      status: String((row as unknown[])[3] ?? "pending"),
      accountDate: formatCellDate((row as unknown[])[4]),
      month: Number((row as unknown[])[5]) || 0,
      year: Number((row as unknown[])[6]) || 0,
      dueDate: formatCellDate((row as unknown[])[7]),
      paidAt: formatCellDate((row as unknown[])[8]),
      consumption:
        (row as unknown[])[9] !== "" && (row as unknown[])[9] != null
          ? Number((row as unknown[])[9])
          : null,
      days:
        (row as unknown[])[10] !== "" && (row as unknown[])[10] != null
          ? Number((row as unknown[])[10])
          : null,
      amount: Number((row as unknown[])[11]) || 0,
      description: String((row as unknown[])[12] ?? "") || null,
    }));
}

export function parseCsvFile(text: string): ImportRowInput[] {
  const lines = text
    .replace(/^﻿/, "")
    .split("\n")
    .filter((l) => l.trim() !== "" && !l.trimStart().startsWith("##"));

  if (lines.length < 2) return [];

  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
    return {
      title: cols[0] ?? "",
      categoryName: cols[1] || null,
      categoryType: cols[2] || null,
      status: cols[3] || "pending",
      accountDate: cols[4] || null,
      month: parseInt(cols[5] ?? "0", 10),
      year: parseInt(cols[6] ?? "0", 10),
      dueDate: cols[7] || null,
      paidAt: cols[8] || null,
      consumption: cols[9] ? parseFloat(cols[9]) : null,
      days: cols[10] ? parseInt(cols[10], 10) : null,
      amount: parseFloat(cols[11] ?? "0"),
      description: cols[12] || null,
    };
  });
}
