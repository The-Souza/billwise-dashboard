"use client";

import { getNotificationPrefsAction } from "@/actions/(user)/settings/get-notification-prefs";
import { updateNotificationPrefsAction } from "@/actions/(user)/settings/update-notification-prefs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import type { NotificationPrefs } from "@/schemas/settings/notification-prefs";
import { appToast } from "@/utils/app-toast";
import { useQuery } from "@tanstack/react-query";
import { BellIcon, ClockIcon, RefreshCw, TrendingUpIcon } from "lucide-react";
import { useEffect, useState } from "react";

const DUE_DAYS_OPTIONS = [
  { value: 1, label: "1 dia antes" },
  { value: 3, label: "3 dias antes" },
  { value: 7, label: "7 dias antes" },
  { value: 15, label: "15 dias antes" },
];

const DEFAULT_PREFS: NotificationPrefs = {
  dueDaysAhead: 3,
  onRecurringGenerated: true,
  onBudgetExceeded: true,
};

export function NotificationPrefsSection() {
  const {
    data: result,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["notification-prefs"],
    queryFn: getNotificationPrefsAction,
  });

  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (result?.success) setPrefs(result.data);
  }, [result]);

  async function handleSave() {
    setIsSaving(true);
    const res = await updateNotificationPrefsAction(prefs);
    if (res.success) {
      appToast.success("Preferências salvas com sucesso.");
      refetch();
    } else {
      appToast.error(res.error);
    }
    setIsSaving(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-heading flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <BellIcon className="h-3.5 w-3.5 text-primary" />
          </div>
          Preferências de notificação
        </CardTitle>
        <CardDescription>
          Controle quando e como você recebe notificações.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 px-6 pb-6">
        {!isLoading && result && !result.success ? (
          <p className="text-sm text-destructive py-4">{result.error}</p>
        ) : (
          <div className="flex flex-col">
            <div>
              <div className="flex items-center gap-4 py-4">
                <div className="p-2 rounded-lg bg-amber-500/10 shrink-0 self-start sm:self-center">
                  <ClockIcon className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex flex-col sm:flex-row justify-between gap-2 w-full">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium">
                      Avisar antes do vencimento
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Notificação antecipada de contas a vencer
                    </span>
                  </div>
                  {isLoading ? (
                    <Skeleton className="h-8 w-36 rounded-md shrink-0" />
                  ) : (
                    <Select
                      value={String(prefs.dueDaysAhead)}
                      onValueChange={(v) =>
                        setPrefs((p) => ({
                          ...p,
                          dueDaysAhead: parseInt(v, 10) as 1 | 3 | 7 | 15,
                        }))
                      }
                    >
                      <SelectTrigger className="w-36 h-8 text-xs shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DUE_DAYS_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={String(option.value)}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 py-4 border-y border-border">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <RefreshCw className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium">
                    Conta recorrente gerada
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Quando o sistema criar automaticamente uma conta recorrente
                  </span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-5 w-9 rounded-full shrink-0" />
                ) : (
                  <Switch
                    id="on-recurring"
                    checked={prefs.onRecurringGenerated}
                    onCheckedChange={(v) =>
                      setPrefs((p) => ({ ...p, onRecurringGenerated: v }))
                    }
                  />
                )}
              </div>

              <div className="flex items-center gap-4 py-4">
                <div className="p-2 rounded-lg bg-orange-500/10 shrink-0">
                  <TrendingUpIcon className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium">
                    Orçamento ultrapassado
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Quando os gastos de uma categoria superarem o limite
                    definido
                  </span>
                </div>
                {isLoading ? (
                  <Skeleton className="h-5 w-9 rounded-full shrink-0" />
                ) : (
                  <Switch
                    id="on-budget"
                    checked={prefs.onBudgetExceeded}
                    onCheckedChange={(v) =>
                      setPrefs((p) => ({ ...p, onBudgetExceeded: v }))
                    }
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="transition-transform ease-in hover:scale-103 active:scale-97"
              >
                {isSaving ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Salvando...
                  </>
                ) : (
                  "Salvar preferências"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
