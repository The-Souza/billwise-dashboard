"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FieldError, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateLocal } from "@/helper/format-date-local";
import { parseDateLocal } from "@/helper/parse-date";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const dateValue = field.value ? parseDateLocal(field.value) : undefined;

  return (
    <>
      <FieldLabel htmlFor={field.name} className="text-md">
        {label}
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={field.name}
            variant="outline"
            className="w-full justify-between font-normal hover:bg-transparent dark:bg-input/30 bg-transparent shadow-xs px-3"
            aria-invalid={fieldState.invalid}
          >
            {dateValue
              ? dateValue.toLocaleDateString("pt-BR")
              : "Selecione uma data"}
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-70 overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            defaultMonth={dateValue}
            onSelect={(date) => {
              field.onChange(date ? formatDateLocal(date) : null);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </>
  );
}
