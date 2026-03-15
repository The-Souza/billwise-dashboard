"use client";

import { useState } from "react";

export type DashboardMonth = {
  month: number;
  year: number;
  label: string;
  isCurrentMonth: boolean;
  prev: () => void;
  next: () => void;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
};

export function useDashboardMonth(): DashboardMonth {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const isCurrentMonth =
    month === now.getMonth() + 1 && year === now.getFullYear();

  function prev() {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function next() {
    if (isCurrentMonth) return;
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1));

  return { month, year, label, isCurrentMonth, prev, next, setMonth, setYear };
}
