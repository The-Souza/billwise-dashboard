"use client";

import { DatePickerInput } from "@/components/ui/date-picker-input";
import { FieldError, FieldLabel } from "@/components/ui/field";
import type {
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
} from "react-hook-form";

interface DatePickerFieldProps<T extends FieldValues, N extends Path<T>> {
  field: ControllerRenderProps<T, N>;
  fieldState: ControllerFieldState;
  label: string;
}

export function DatePickerField<T extends FieldValues, N extends Path<T>>({
  field,
  fieldState,
  label,
}: DatePickerFieldProps<T, N>) {
  return (
    <>
      <FieldLabel htmlFor={field.name} className="text-md">
        {label}
      </FieldLabel>
      <DatePickerInput
        id={field.name}
        value={field.value ?? ""}
        onChange={(v) => field.onChange(v || null)}
        invalid={fieldState.invalid}
      />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </>
  );
}
