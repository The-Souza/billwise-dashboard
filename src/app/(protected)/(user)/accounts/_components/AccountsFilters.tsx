"use client";

import { AccountFilters } from "@/actions/(user)/accounts/get-accounts";
import { CategoryOption } from "@/actions/(user)/accounts/get-categories";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { account_status } from "@/generated/prisma/enums";
import { useAccountsFileActions } from "@/hooks/use-accounts-file-actions";
import { useMobile } from "@/hooks/use-mobile";
import { STATUS_OPTIONS } from "@/utils/status-options";
import {
  ChevronDownIcon,
  DownloadIcon,
  FileTextIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface AccountsFiltersProps {
  filters: AccountFilters;
  selectedCount: number;
  categories: CategoryOption[];
  onFiltersChange: (filters: Partial<AccountFilters>) => void;
  onDelete: () => void;
  onImportSuccess?: () => void;
}

export function AccountsFilters({
  filters,
  selectedCount,
  categories,
  onFiltersChange,
  onDelete,
  onImportSuccess,
}: AccountsFiltersProps) {
  const [titleInput, setTitleInput] = useState(filters.title ?? "");
  const isMobile = useMobile();

  const {
    isBusy,
    fileInputRef,
    handleExport,
    handleDownloadTemplate,
    handleImportFile,
  } = useAccountsFileActions({ filters, onImportSuccess });

  const debouncedTitleChange = useDebouncedCallback((value: string) => {
    onFiltersChange({ title: value || undefined, page: 1 });
  }, 400);

  useEffect(() => {
    debouncedTitleChange(titleInput);
  }, [titleInput, debouncedTitleChange]);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-2 w-full lg:w-auto">
      <div className="grid grid-cols-2 lg:flex lg:flex-wrap items-center gap-2 w-full lg:w-auto">
        <InputGroup className="h-8 col-span-2 lg:w-44 text-xs">
          <InputGroupInput
            placeholder="Buscar por título..."
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
          />
        </InputGroup>

        <Select
          value={filters.status ?? "all"}
          onValueChange={(value) =>
            onFiltersChange({
              status: value === "all" ? undefined : (value as account_status),
              page: 1,
            })
          }
        >
          <SelectTrigger className="h-8 w-full lg:w-35 text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.categoryId ?? "all"}
          onValueChange={(value) =>
            onFiltersChange({
              categoryId: value === "all" ? undefined : value,
              page: 1,
            })
          }
        >
          <SelectTrigger className="h-8 w-full lg:w-35 text-xs">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            <SelectGroup>
              <SelectLabel className="text-muted-foreground text-xs">
                Todas as categorias
              </SelectLabel>
              <SelectItem value="all">Todas</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel className="text-muted-foreground text-xs">
                Despesas
              </SelectLabel>
              {categories
                .filter((cat) => cat.type === "expense")
                .map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel className="text-muted-foreground text-xs">
                Receitas
              </SelectLabel>
              {categories
                .filter((cat) => cat.type === "income")
                .map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 w-full lg:w-auto">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 hover:text-destructive hover:border-destructive/50 w-full lg:w-auto transition-transform ease-in hover:scale-103 active:scale-97"
          disabled={selectedCount === 0}
          onClick={onDelete}
        >
          <Trash2Icon />
          Excluir
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs w-full lg:w-auto transition-transform ease-in hover:scale-103 active:scale-97"
              disabled={isBusy}
            >
              Arquivo
              <ChevronDownIcon className="h-3 w-3 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isMobile ? "center" : "end"}>
            <DropdownMenuItem
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
            >
              <UploadIcon className="h-3.5 w-3.5" />
              <div className="flex flex-col gap-0.5">
                <span>Importar</span>
                <span className="text-xs text-muted-foreground font-normal leading-none">
                  .xlsx ou .csv
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExport} disabled={isBusy}>
              <DownloadIcon className="h-3.5 w-3.5" />
              Exportar .xlsx
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDownloadTemplate}
              disabled={isBusy}
            >
              <FileTextIcon className="h-3.5 w-3.5" />
              Baixar template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs w-full lg:w-auto transition-transform ease-in hover:scale-103 active:scale-97"
          asChild
        >
          <Link href="/accounts/add-account">
            <PlusIcon />
            Nova conta
          </Link>
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        onChange={handleImportFile}
      />
    </div>
  );
}
