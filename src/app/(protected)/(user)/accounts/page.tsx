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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-bold">Contas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie todas as suas contas.
          </p>
        </div>
        <MonthPicker {...dashboardMonth} onSelect={handleMonthSelect} />
      </div>

      <AccountsDataTable
        dashboardMonth={dashboardMonth}
        categories={categories}
      />
    </div>
  );
}
