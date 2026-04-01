"use client";

import { AccountRow } from "@/actions/(user)/accounts/get-accounts";
import { AppBadge, AppBadgeVariant } from "@/components/ui/app-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";
import { ColumnDef } from "@tanstack/react-table";
import { icons, PencilIcon, RefreshCw, Trash2Icon } from "lucide-react";
import Link from "next/link";

export function accountColumns(
  onDelete: (account: AccountRow) => void,
): ColumnDef<AccountRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          className="bg-background"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Selecionar tudo"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className="bg-background"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Selecionar linha"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    {
      accessorKey: "title",
      header: "Título",
      cell: ({ row }) => (
        <span className="font-medium capitalize">{row.getValue("title")}</span>
      ),
    },

    {
      accessorKey: "category",
      header: "Categoria",
      cell: ({ row }) => {
        const icon = row.original.categoryIcon;
        const IconComponent = icon
          ? (icons[icon as keyof typeof icons] as React.ElementType)
          : null;

        return (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground capitalize">
            {IconComponent && <IconComponent className="h-3.5 w-3.5" />}
            {row.getValue("category")}
          </span>
        );
      },
    },

    {
      accessorKey: "dueDate",
      header: "Vencimento",
      cell: ({ row }) => {
        const date = row.getValue("dueDate") as string | null;
        return (
          <span className="text-sm text-muted-foreground capitalize">
            {date ? formatDate(date) : "—"}
          </span>
        );
      },
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <AppBadge variant={row.getValue("status") as AppBadgeVariant} />
      ),
    },

    {
      accessorKey: "isRecurring",
      header: "Recorrente",
      cell: ({ row }) =>
        row.getValue("isRecurring") ? (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <RefreshCw className="h-3 w-3" />
            Sim
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },

    {
      accessorKey: "installments",
      header: "Parcelas",
      cell: ({ row }) => {
        const inst = row.original.installments;
        return inst ? (
          <span className="text-sm text-muted-foreground">
            {inst.current}/{inst.total}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      },
    },

    {
      accessorKey: "amount",
      header: () => <span className="block text-right">Valor</span>,
      cell: ({ row }) => {
        const isIncome = row.original.categoryType === "income";
        return (
          <span
            className={`block text-right font-medium ${
              isIncome ? "text-emerald-500" : "text-destructive"
            }`}
          >
            {isIncome ? "+" : "-"} {formatCurrency(row.getValue("amount"))}
          </span>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      meta: { className: "w-16 whitespace-nowrap" },
      header: () => <span className="block text-center">Ações</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href={`/accounts/${row.original.id}`}>
              <PencilIcon className="h-3.5 w-3.5" />
              <span className="sr-only">Editar</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(row.original)}
          >
            <Trash2Icon className="h-3.5 w-3.5" />
            <span className="sr-only">Excluir</span>
          </Button>
        </div>
      ),
    },
  ];
}
