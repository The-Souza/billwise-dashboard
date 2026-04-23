"use client";

import { FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useState } from "react";
import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";

interface CurrencyInputFieldProps<T extends FieldValues, N extends Path<T>> {
  field: ControllerRenderProps<T, N>;
  fieldState: ControllerFieldState;
}

export function CurrencyInputField<T extends FieldValues, N extends Path<T>>({
  field,
  fieldState,
}: CurrencyInputFieldProps<T, N>) {
  const [raw, setRaw] = useState(
    (field.value as number | undefined)?.toString() ?? "",
  );

  return (
    <>
      <FieldLabel htmlFor={field.name} className="text-md">
        Valor (R$)
      </FieldLabel>
      <InputGroup>
        <InputGroupAddon className="text-muted-foreground text-sm font-medium">
          R$
        </InputGroupAddon>
        <InputGroupInput
          id={field.name}
          type="text"
          inputMode="decimal"
          placeholder="0,00"
          value={raw}
          aria-invalid={fieldState.invalid}
          onChange={(e) => {
            const text = e.target.value;
            setRaw(text);
            const val = parseFloat(text.replace(",", "."));
            field.onChange(isNaN(val) ? undefined : val);
          }}
        />
      </InputGroup>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </>
  );
}
