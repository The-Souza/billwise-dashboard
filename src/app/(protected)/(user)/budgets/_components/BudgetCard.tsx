"use client";

import { BudgetRow } from "@/actions/(user)/budgets/get-budgets";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format-currency";
import { getStatusClasses } from "@/utils/get-status-classes";
import { icons, PencilIcon, Trash2Icon } from "lucide-react";
import React from "react";
import { PercentageBadge } from "./PercentageBadge";
import { StatusLabel } from "./StatusLabel";

interface BudgetCardProps {
  budget: BudgetRow;
  onEdit: (budget: BudgetRow) => void;
  onDelete: (budget: BudgetRow) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const IconComponent = budget.categoryIcon
    ? (icons[budget.categoryIcon as keyof typeof icons] as React.ElementType)
    : null;

  const isIncome = budget.categoryType === "income";
  const percentage = Math.min(budget.usedPercentage, 100);
  const classes = getStatusClasses(budget.usedPercentage, isIncome);

  return (
    <Card className={cn("flex flex-col gap-3 p-4 border-l-2", classes.accent)}>
      <CardHeader className="flex flex-row items-center justify-between p-0 gap-2">
        <span className="flex items-center gap-2 text-sm font-medium min-w-0">
          {IconComponent && (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <IconComponent className="h-3.5 w-3.5 text-primary" />
            </span>
          )}
          <span className="truncate">{budget.categoryName}</span>
        </span>

        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(budget)}
          >
            <PencilIcon className="h-3.5 w-3.5" />
            <span className="sr-only">Editar</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(budget)}
          >
            <Trash2Icon className="h-3.5 w-3.5" />
            <span className="sr-only">Excluir</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5 p-0">
        <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              classes.bar,
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatCurrency(budget.spentAmount)}{" "}
            <span className="text-muted-foreground/60">de</span>{" "}
            {formatCurrency(budget.budgetAmount)}
          </span>
          <PercentageBadge
            budget={budget}
            isIncome={isIncome}
            classes={classes}
          />
        </div>

        <p className="text-xs">
          <StatusLabel budget={budget} isIncome={isIncome} />
        </p>
      </CardContent>
    </Card>
  );
}
