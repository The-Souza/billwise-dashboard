"use client";

import {
  getRecurringRulesAction,
  RecurringRuleRow,
} from "@/actions/(user)/settings/get-recurring-rules";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SWR_DEFAULT_OPTIONS } from "@/config/swr";
import { formatCurrency } from "@/utils/format-currency";
import { formatRuleEndDate } from "@/utils/format-date";
import { capitalizeFirst, formatRecurrenceDuration } from "@/utils/format-text";
import { icons, PencilIcon, RefreshCw, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { DeleteRuleAlertDialog } from "./DeleteRuleAlertDialog";
import { EditRuleDialog } from "./EditRuleDialog";
import { RecurringRulesSkeleton } from "./RecurringRulesSkeleton";

export function RecurringRulesSection() {
  const {
    data: result,
    isLoading,
    mutate,
  } = useSWR("recurring-rules", getRecurringRulesAction, SWR_DEFAULT_OPTIONS);

  const rules = result?.success ? result.data : [];

  const [editRule, setEditRule] = useState<RecurringRuleRow | null>(null);
  const [deleteRule, setDeleteRule] = useState<RecurringRuleRow | null>(null);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <RefreshCw className="h-3.5 w-3.5 text-primary" />
            </div>
            Regras recorrentes
          </CardTitle>
          <CardDescription>
            Contas geradas automaticamente todo mês. Edite o prazo ou exclua uma
            regra.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <RecurringRulesSkeleton />
          ) : rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-6">
              <div className="p-3 rounded-full bg-muted">
                <RefreshCw className="h-5 w-5 text-muted-foreground opacity-50" />
              </div>
              <p className="text-sm font-medium">Nenhuma regra ativa</p>
              <p className="text-xs text-muted-foreground">
                Crie uma conta recorrente em{" "}
                <Link
                  href="/accounts/add-account"
                  className="text-primary underline underline-offset-2"
                >
                  Contas
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {rules.map((rule) => {
                const IconComponent = rule.categoryIcon
                  ? (icons[
                      rule.categoryIcon as keyof typeof icons
                    ] as React.ElementType)
                  : null;

                return (
                  <div
                    key={rule.id}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      {IconComponent ? (
                        <IconComponent className="h-4 w-4 text-primary" />
                      ) : (
                        <RefreshCw className="h-4 w-4 text-primary" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium leading-tight truncate">
                        {capitalizeFirst(rule.title)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {rule.categoryName ?? "Sem categoria"}
                        {formatRecurrenceDuration(rule.recurrenceMonths)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-0.5 shrink-0 text-right">
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          rule.categoryType === "income"
                            ? "text-emerald-500"
                            : "text-destructive"
                        }`}
                      >
                        {formatCurrency(rule.amount)}
                      </span>
                      <span className="hidden sm:block text-xs text-muted-foreground">
                        {rule.endDate
                          ? `Até ${formatRuleEndDate(rule.endDate)}`
                          : "Sem prazo"}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => setEditRule(rule)}
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteRule(rule)}
                      >
                        <Trash2Icon className="h-3.5 w-3.5" />
                        <span className="sr-only">Excluir</span>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <EditRuleDialog
        key={editRule?.id ?? "none"}
        rule={editRule}
        onClose={() => setEditRule(null)}
        onSaved={() => {
          setEditRule(null);
          mutate();
        }}
      />

      <DeleteRuleAlertDialog
        rule={deleteRule}
        onClose={() => setDeleteRule(null)}
        onDeleted={() => {
          setDeleteRule(null);
          mutate();
        }}
      />
    </>
  );
}
