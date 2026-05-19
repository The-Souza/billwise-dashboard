"use client";

import { exportAccountsAction } from "@/actions/(user)/accounts/export-accounts";
import { AccountFilters } from "@/actions/(user)/accounts/get-accounts";
import { getImportTemplateAction } from "@/actions/(user)/accounts/get-import-template";
import { importAccountsAction } from "@/actions/(user)/accounts/import-accounts";
import { parseCsvFile, parseXlsxFile } from "@/utils/account-import";
import { appToast } from "@/utils/app-toast";
import { downloadXlsx } from "@/utils/file-download";
import { useRef, useState } from "react";

interface UseAccountsFileActionsProps {
  filters: Pick<AccountFilters, "month" | "year">;
  onImportSuccess?: () => void;
}

export function useAccountsFileActions({
  filters,
  onImportSuccess,
}: UseAccountsFileActionsProps) {
  const [isBusy, setIsBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setIsBusy(true);
    const res = await exportAccountsAction({
      month: filters.month,
      year: filters.year,
    });
    if (res.success) {
      downloadXlsx(res.data, res.filename);
    } else {
      appToast.error(res.error);
    }
    setIsBusy(false);
  }

  async function handleDownloadTemplate() {
    setIsBusy(true);
    const res = await getImportTemplateAction();
    if (res.success) {
      downloadXlsx(res.data, res.filename);
    } else {
      appToast.error(res.error);
    }
    setIsBusy(false);
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = "";
    if (!file) return;

    setIsBusy(true);
    try {
      const isXlsx = file.name.toLowerCase().endsWith(".xlsx");
      const rows = isXlsx
        ? await parseXlsxFile(file)
        : parseCsvFile(await file.text());

      if (rows.length === 0) {
        appToast.error("Arquivo vazio ou sem dados válidos.");
        setIsBusy(false);
        return;
      }

      const res = await importAccountsAction(rows);
      if (res.success) {
        appToast.success(
          `${res.created} conta${res.created !== 1 ? "s" : ""} importada${res.created !== 1 ? "s" : ""} com sucesso.`,
        );
        onImportSuccess?.();
      } else {
        appToast.error(res.error);
      }
    } catch {
      appToast.error("Erro ao ler o arquivo.");
    }
    setIsBusy(false);
  }

  return {
    isBusy,
    fileInputRef,
    handleExport,
    handleDownloadTemplate,
    handleImportFile,
  };
}
