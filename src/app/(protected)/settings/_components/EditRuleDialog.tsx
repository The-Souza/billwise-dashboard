"use client";

import { updateRecurringRuleAction } from "@/actions/(user)/settings/update-recurring-rule";
import type { RecurringRuleRow } from "@/actions/(user)/settings/get-recurring-rules";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { appToast } from "@/utils/app-toast";
import { computeRecurrenceEndDate } from "@/utils/format-date";
import { capitalizeFirst } from "@/utils/format-text";
import { PencilIcon } from "lucide-react";
import { useState } from "react";

interface EditRuleDialogProps {
  rule: RecurringRuleRow | null;
  onClose: () => void;
  onSaved: () => void;
}

export function EditRuleDialog({ rule, onClose, onSaved }: EditRuleDialogProps) {
  const [editUnit, setEditUnit] = useState<"meses" | "anos">(() => {
    const m = rule?.recurrenceMonths;
    return m && m % 12 === 0 && m >= 12 ? "anos" : "meses";
  });
  const [editDuration, setEditDuration] = useState(() => {
    const m = rule?.recurrenceMonths;
    if (!m) return "";
    if (m % 12 === 0 && m >= 12) return String(m / 12);
    return String(m);
  });
  const [isSaving, setIsSaving] = useState(false);

  function totalMonths(): number | null {
    const n = parseInt(editDuration, 10);
    if (!n || n <= 0) return null;
    return editUnit === "anos" ? n * 12 : n;
  }

  async function handleSave() {
    if (!rule) return;
    setIsSaving(true);

    const months = totalMonths();
    const endDate = months ? computeRecurrenceEndDate(rule.startDate, months) : null;

    const res = await updateRecurringRuleAction({ id: rule.id, endDate, recurrenceMonths: months });

    if (res.success) {
      appToast.success("Regra atualizada com sucesso.");
      onSaved();
    } else {
      appToast.error(res.error);
    }

    setIsSaving(false);
  }

  return (
    <Dialog open={!!rule} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100vw-2rem)] rounded-md max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10">
              <PencilIcon className="h-4 w-4 text-primary" />
            </div>
            Editar regra recorrente
          </DialogTitle>
          <DialogDescription>
            Defina por quanto tempo &ldquo;
            {capitalizeFirst(rule?.title ?? "")}&rdquo; deve se repetir.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-duration">Duração</Label>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs transition-colors ${editUnit === "meses" ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  meses
                </span>
                <Switch
                  checked={editUnit === "anos"}
                  onCheckedChange={(checked) =>
                    setEditUnit(checked ? "anos" : "meses")
                  }
                />
                <span
                  className={`text-xs transition-colors ${editUnit === "anos" ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  anos
                </span>
              </div>
            </div>
            <InputGroup>
              <InputGroupInput
                id="edit-duration"
                type="number"
                min={1}
                value={editDuration}
                onChange={(e) => setEditDuration(e.target.value)}
                placeholder={`Ex: ${editUnit === "anos" ? "2" : "24"}`}
              />
            </InputGroup>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Término estimado:{" "}
              {(() => {
                if (!editDuration || !rule) return <span>—</span>;
                const months = totalMonths();
                if (!months) return <span>—</span>;
                const end = computeRecurrenceEndDate(rule.startDate, months);
                const label = new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(end));
                return <span className="text-foreground font-medium">{label}</span>;
              })()}
            </p>
            {editDuration && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground hover:bg-transparent underline underline-offset-2 ml-auto"
                onClick={() => setEditDuration("")}
              >
                Sem prazo definido
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            variant="outline"
            className="transition-transform ease-in hover:scale-103 active:scale-97"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            className="transition-transform ease-in hover:scale-103 active:scale-97"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Spinner data-icon="inline-start" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
