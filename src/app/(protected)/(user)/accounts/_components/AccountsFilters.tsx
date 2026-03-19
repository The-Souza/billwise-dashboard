// src/app/(protected)/(user)/accounts/_components/AccountsFilters.tsx
"use client";

import { AccountFilters } from "@/actions/(user)/accounts/get-accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { account_status } from "@/generated/prisma/enums";
import { PlusIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

// futuramente: buscar via action
const SYSTEM_CATEGORIES = [
  { id: "29f81f88-d604-4596-bc2f-24ec0d8d9378", name: "Lazer" },
  { id: "382ecd26-bece-4932-87d1-a949808caf45", name: "Moradia" },
  { id: "3f612a35-4425-46bc-9109-591b2b13ea21", name: "Transporte" },
  { id: "47e01a23-6b6a-46f3-8d99-d87856f5e085", name: "Outros" },
  { id: "926bb5c9-4df5-4e5b-b418-f371b5f94fa3", name: "Alimentação" },
  { id: "b7f54fb7-c87e-4649-800a-305d634b3481", name: "Saúde" },
  { id: "e2ae2e82-6f7b-4338-9d87-06f9a0401ecc", name: "Salário" },
  { id: "eefcd5f6-b344-4f10-966b-cf277030e8f9", name: "Educação" },
];

interface AccountsFiltersProps {
  filters: AccountFilters;
  selectedCount: number;
  onFiltersChange: (filters: Partial<AccountFilters>) => void;
  onDelete: () => void;
}

export function AccountsFilters({
  filters,
  selectedCount,
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
        <Input
          placeholder="Buscar por título..."
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          className="h-8 col-span-2 sm:w-44 text-xs"
        />

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
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="overdue">Vencido</SelectItem>
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
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {SYSTEM_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 hover:text-primary w-full sm:w-auto"
          disabled={selectedCount === 0}
          onClick={onDelete}
        >
          <Trash2Icon />
          Excluir
        </Button>

        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs w-full sm:w-auto"
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
