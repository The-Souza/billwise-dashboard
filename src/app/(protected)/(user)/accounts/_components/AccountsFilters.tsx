"use client";

import { AccountFilters } from "@/actions/(user)/accounts/get-accounts";
import { CategoryOption } from "@/actions/(user)/accounts/get-categories";
import { Button } from "@/components/ui/button";
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
import { STATUS_OPTIONS } from "@/utils/status-options";
import { PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

interface AccountsFiltersProps {
  filters: AccountFilters;
  selectedCount: number;
  categories: CategoryOption[];
  onFiltersChange: (filters: Partial<AccountFilters>) => void;
  onDelete: () => void;
}

export function AccountsFilters({
  filters,
  selectedCount,
  categories,
  onFiltersChange,
  onDelete,
}: AccountsFiltersProps) {
  const [titleInput, setTitleInput] = useState(filters.title ?? "");

  const debouncedTitleChange = useDebouncedCallback((value: string) => {
    onFiltersChange({ title: value || undefined, page: 1 });
  }, 400);

  useEffect(() => {
    debouncedTitleChange(titleInput);
  }, [titleInput, debouncedTitleChange]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 w-full lg:w-auto">
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
        <InputGroup className="h-8 col-span-2 sm:w-44 text-xs">
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
          <SelectTrigger className="h-8 w-full sm:w-35 text-xs">
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
          <SelectTrigger className="h-8 w-full sm:w-35 text-xs">
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

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 hover:text-destructive hover:border-destructive/50 w-full sm:w-auto transition-transform ease-in hover:scale-103 active:scale-97"
          disabled={selectedCount === 0}
          onClick={onDelete}
        >
          <Trash2Icon />
          Excluir
        </Button>

        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs w-full sm:w-auto transition-transform ease-in hover:scale-103 active:scale-97"
          asChild
        >
          <Link href="/accounts/add-account">
            <PlusIcon />
            Nova conta
          </Link>
        </Button>
      </div>
    </div>
  );
}
