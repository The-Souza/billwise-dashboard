"use client";

import {
  CategoryOption,
  getCategoriesAction,
} from "@/actions/(user)/accounts/get-categories";
import { MonthPicker } from "@/components/ui/month-picker";
import { useDashboardMonth } from "@/hooks/use-dashboard-month";
import { useEffect, useState } from "react";
import { AccountsDataTable } from "./_components/AccountsDataTable";

export default function AccountsPage() {
  const dashboardMonth = useDashboardMonth();
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  useEffect(() => {
    getCategoriesAction().then((result) => {
      if (result.success) setCategories(result.data);
    });
  }, []);

  function handleMonthSelect(m: number, y: number) {
    dashboardMonth.setMonth(m);
    dashboardMonth.setYear(y);
  }

  return (
    <div className="flex flex-col gap-4 min-h-full">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <h1 className="text-lg font-bold font-heading tracking-tight">
          Gerencie todas as suas contas
        </h1>
        <MonthPicker {...dashboardMonth} onSelect={handleMonthSelect} />
      </div>

      <AccountsDataTable
        dashboardMonth={dashboardMonth}
        categories={categories}
      />
    </div>
  );
}
