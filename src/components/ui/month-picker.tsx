"use client";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DashboardMonth } from "@/hooks/use-dashboard-month";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { useState } from "react";

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

interface MonthPickerProps extends DashboardMonth {
  onSelect: (month: number, year: number) => void;
}

export function MonthPicker({
  month,
  year,
  label,
  isCurrentMonth,
  prev,
  next,
  onSelect,
}: MonthPickerProps) {
  const [open, setOpen] = useState(false);
  const [popoverYear, setPopoverYear] = useState(year);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  function handleSelect(m: number) {
    onSelect(m, popoverYear);
    setOpen(false);
  }

  function isFuture(m: number) {
    return (
      popoverYear > currentYear ||
      (popoverYear === currentYear && m > currentMonth)
    );
  }

  function isSelected(m: number) {
    return m === month && popoverYear === year;
  }

  return (
    <div className="flex items-center">
      <ButtonGroup aria-label="Button group">
        <Button
          variant="outline"
          className="bg-popover"
          size="icon-sm"
          onClick={prev}
        >
          <ChevronsLeftIcon />
        </Button>

        <Popover
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (isOpen) setPopoverYear(year);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-8 px-3 gap-1.5 text-xs font-medium bg-popover capitalize min-w-40 justify-between"
            >
              <CalendarIcon className="text-muted-foreground shrink-0" />
              <span className="flex-1 text-center">{label}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-50 sm:w-40 p-3" align="center">
            <div className="flex items-center justify-between mb-3">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setPopoverYear((y) => y - 1)}
              >
                <ChevronsLeftIcon />
              </Button>
              <span className="text-sm font-medium">{popoverYear}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={popoverYear >= currentYear}
                onClick={() => setPopoverYear((y) => y + 1)}
              >
                <ChevronsRightIcon />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-1">
              {MONTHS.map((name, i) => {
                const m = i + 1;
                const future = isFuture(m);
                const selected = isSelected(m);

                return (
                  <Button
                    key={m}
                    variant={selected ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-8 text-xs",
                      future && "opacity-30 cursor-not-allowed",
                    )}
                    disabled={future}
                    onClick={() => handleSelect(m)}
                  >
                    {name}
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Botão próximo — faz parte do grupo visual */}
        <Button
          variant="outline"
          className="bg-popover"
          size="icon-sm"
          onClick={next}
          disabled={isCurrentMonth}
        >
          <ChevronsRightIcon />
        </Button>
      </ButtonGroup>
    </div>
  );
}
