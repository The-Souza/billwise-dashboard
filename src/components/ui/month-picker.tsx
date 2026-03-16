"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DashboardMonth } from "@/hooks/use-dashboard-month";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
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
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon-xs" onClick={prev}>
        <ChevronLeftIcon />
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
            className="h-7 px-3 gap-1.5 text-xs font-medium capitalize min-w-36 justify-between"
          >
            <CalendarIcon className="text-muted-foreground" />
            <span className="flex-1 text-center">{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3" align="center">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setPopoverYear((y) => y - 1)}
            >
              <ChevronLeftIcon />
            </Button>
            <span className="text-sm font-medium">{popoverYear}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              disabled={popoverYear >= currentYear}
              onClick={() => setPopoverYear((y) => y + 1)}
            >
              <ChevronRightIcon />
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
                    "h-8 text-sm",
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

      <Button
        variant="ghost"
        size="icon-xs"
        onClick={next}
        disabled={isCurrentMonth}
      >
        <ChevronRightIcon />
      </Button>
    </div>
  );
}
