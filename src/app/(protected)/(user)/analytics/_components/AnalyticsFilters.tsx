"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  AnalyticsFiltersState,
  AnalyticsType,
} from "@/hooks/use-analytics-filters";
import { CalendarRangeIcon } from "lucide-react";

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

const now = new Date();
const YEARS = Array.from(
  { length: now.getFullYear() - 2019 },
  (_, i) => 2020 + i,
);

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersState;
}

export function AnalyticsFilters({ filters }: AnalyticsFiltersProps) {
  const {
    startMonth,
    startYear,
    endMonth,
    endYear,
    type,
    setStart,
    setEnd,
    setType,
  } = filters;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <CalendarRangeIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="flex items-center gap-1.5">
          <Select
            value={String(startMonth)}
            onValueChange={(v) => setStart(parseInt(v), startYear)}
          >
            <SelectTrigger className="w-18 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((name, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(startYear)}
            onValueChange={(v) => setStart(startMonth, parseInt(v))}
          >
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span className="text-xs text-muted-foreground">até</span>

        <div className="flex items-center gap-1.5">
          <Select
            value={String(endMonth)}
            onValueChange={(v) => setEnd(parseInt(v), endYear)}
          >
            <SelectTrigger className="w-18 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {MONTHS.map((name, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={String(endYear)}
            onValueChange={(v) => setEnd(endMonth, parseInt(v))}
          >
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs
        value={type}
        onValueChange={(v) => setType(v as AnalyticsType)}
        className="w-full lg:w-auto flex-1 lg:flex-none"
      >
        <TabsList className="h-8 w-full lg:w-auto">
          <TabsTrigger value="all" className="text-xs flex-1">
            Todos
          </TabsTrigger>
          <TabsTrigger value="income" className="text-xs flex-1">
            Receitas
          </TabsTrigger>
          <TabsTrigger value="expense" className="text-xs flex-1">
            Despesas
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
