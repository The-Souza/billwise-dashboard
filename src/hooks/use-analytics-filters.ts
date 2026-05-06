"use client";

import type { AnalyticsType } from "@/schemas/analytics/analytics-filters";
import { useState } from "react";

export type { AnalyticsType };

export interface AnalyticsFiltersState {
  startMonth: number;
  startYear: number;
  endMonth: number;
  endYear: number;
  type: AnalyticsType;
  setStart: (month: number, year: number) => void;
  setEnd: (month: number, year: number) => void;
  setType: (type: AnalyticsType) => void;
}

export function useAnalyticsFilters(): AnalyticsFiltersState {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const initStart = (() => {
    let m = currentMonth - 3;
    let y = currentYear;
    if (m <= 0) {
      m += 12;
      y -= 1;
    }
    return { month: m, year: y };
  })();

  const [startMonth, setStartMonth] = useState(initStart.month);
  const [startYear, setStartYear] = useState(initStart.year);
  const [endMonth, setEndMonth] = useState(currentMonth);
  const [endYear, setEndYear] = useState(currentYear);
  const [type, setType] = useState<AnalyticsType>("all");

  function setStart(month: number, year: number) {
    setStartMonth(month);
    setStartYear(year);
    if (year * 100 + month > endYear * 100 + endMonth) {
      setEndMonth(month);
      setEndYear(year);
    }
  }

  function setEnd(month: number, year: number) {
    setEndMonth(month);
    setEndYear(year);
    if (year * 100 + month < startYear * 100 + startMonth) {
      setStartMonth(month);
      setStartYear(year);
    }
  }

  return {
    startMonth,
    startYear,
    endMonth,
    endYear,
    type,
    setStart,
    setEnd,
    setType,
  };
}
