"use client";

import { FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

interface RecurrenceDurationInputProps {
  value: number | null;
  onChange: (months: number | null) => void;
  fieldName?: string;
  invalid?: boolean;
  disabled?: boolean;
}

export function RecurrenceDurationInput({
  value,
  onChange,
  fieldName,
  invalid,
  disabled,
}: RecurrenceDurationInputProps) {
  const [unit, setUnit] = useState<"meses" | "anos">(() => {
    if (value && value % 12 === 0 && value >= 12) return "anos";
    return "meses";
  });

  const [duration, setDuration] = useState(() => {
    if (!value) return "";
    if (value % 12 === 0 && value >= 12) return String(value / 12);
    return String(value);
  });

  function handleDurationChange(raw: string) {
    setDuration(raw);
    const n = parseInt(raw, 10);
    onChange(!n || n <= 0 ? null : unit === "anos" ? n * 12 : n);
  }

  function handleUnitChange(checked: boolean) {
    if (disabled) return;
    const newUnit = checked ? "anos" : "meses";
    setUnit(newUnit);
    const n = parseInt(duration, 10);
    if (n > 0) onChange(newUnit === "anos" ? n * 12 : n);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor={fieldName} className="text-md">
          Gerar próximos
        </FieldLabel>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs transition-colors ${!disabled && unit === "meses" ? "text-foreground font-medium" : "text-muted-foreground"}`}
          >
            meses
          </span>
          <Switch
            checked={unit === "anos"}
            onCheckedChange={handleUnitChange}
            disabled={disabled}
          />
          <span
            className={`text-xs transition-colors ${!disabled && unit === "anos" ? "text-foreground font-medium" : "text-muted-foreground"}`}
          >
            anos
          </span>
        </div>
      </div>
      <InputGroup>
        <InputGroupInput
          id={fieldName}
          type="number"
          min={1}
          autoComplete="off"
          value={disabled ? "" : duration}
          onChange={(e) => handleDurationChange(e.target.value)}
          placeholder={disabled ? "—" : `Ex: ${unit === "anos" ? "2" : "24"}`}
          aria-invalid={invalid}
          disabled={disabled}
        />
      </InputGroup>
      <p className="text-xs text-muted-foreground">
        Deixe vazio para gerar sem limite de prazo.
      </p>
    </div>
  );
}
