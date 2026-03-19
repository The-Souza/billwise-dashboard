"use client";

import { MonthPicker } from "@/components/ui/month-picker";
import { useDashboardMonth } from "@/hooks/use-dashboard-month";
import { AccountsDataTable } from "./_components/AccountsDataTable";

export default function AccountsPage() {
  const dashboardMonth = useDashboardMonth();

  function handleMonthSelect(m: number, y: number) {
    dashboardMonth.setMonth(m);
    dashboardMonth.setYear(y);
  }

  return (
    <div className="flex flex-col gap-4 min-h-full">
      <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2">
        <h1 className="text-lg font-bold font-heading tracking-tight">
          Gerencie todas as suas contas
        </h1>
        <MonthPicker {...dashboardMonth} onSelect={handleMonthSelect} />
      </div>

      <AccountsDataTable dashboardMonth={dashboardMonth} />
    </div>
  );
}
