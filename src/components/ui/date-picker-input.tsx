"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateLocal } from "@/helper/format-date-local";
import { parseDateLocal } from "@/helper/parse-date";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { useState } from "react";

interface DatePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  id?: string;
}

export function DatePickerInput({
  value,
  onChange,
  placeholder = "Selecione uma data",
  invalid,
  id,
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false);
  const dateValue = value ? parseDateLocal(value) : undefined;

  return (
    <div className="relative flex items-center w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={`w-full justify-between font-normal hover:bg-transparent dark:bg-input/30 bg-transparent shadow-xs px-3 ${value ? "pr-8" : ""}`}
            aria-invalid={invalid}
          >
            <span className={dateValue ? undefined : "text-muted-foreground"}>
              {dateValue ? dateValue.toLocaleDateString("pt-BR") : placeholder}
            </span>
            {!value && (
              <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-70 min-h-78 h-auto max-h-90 overflow-auto p-0"
          align="start"
          collisionPadding={16}
        >
          <Calendar
            mode="single"
            selected={dateValue}
            defaultMonth={dateValue}
            onSelect={(date) => {
              onChange(date ? formatDateLocal(date) : "");
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>

      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-transparent"
          onClick={() => onChange("")}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
