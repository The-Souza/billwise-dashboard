"use client";

import { getBudgetProgressAction } from "@/actions/(user)/get-budget-progress";
import { getChartDataAction } from "@/actions/(user)/get-chart-data";
import { getRecentAccountsAction } from "@/actions/(user)/get-recent-accounts";
import { getSummaryAction } from "@/actions/(user)/get-summary";
import { MonthPicker } from "@/components/ui/month-picker";
import { useDashboardMonth } from "@/hooks/use-dashboard-month";
import useSWR from "swr";
import { BudgetProgress } from "./_components/BudgetProgress";
import { RecentAccountTable } from "./_components/RecentAccountsTable";
import { RevenueExpenseChart } from "./_components/RevenueExpenseChart";
import { SummaryCard } from "./_components/SummaryCard";

export default function DashboardPage() {
  const dashboardMonth = useDashboardMonth();
  const { month, year, label } = dashboardMonth;

  const { data: summary, isLoading: loadingSummary } = useSWR(
    ["dashboard-summary", month, year],
    () =>
      getSummaryAction(month, year).then((r) => (r.success ? r.data : null)),
  );

  const { data: chartData, isLoading: loadingChart } = useSWR(
    ["dashboard-chart", month, year],
    () =>
      getChartDataAction(month, year, 12).then((r) =>
        r.success ? r.data : [],
      ),
  );

  const { data: budgets, isLoading: loadingBudgets } = useSWR(
    ["dashboard-budgets", month, year],
    () =>
      getBudgetProgressAction(month, year).then((r) =>
        r.success ? r.data : [],
      ),
  );

  const { data: accounts, isLoading: loadingAccounts } = useSWR(
    ["dashboard-accounts", month, year],
    () =>
      getRecentAccountsAction(month, year).then((r) =>
        r.success ? r.data : [],
      ),
  );

  function handleMonthSelect(m: number, y: number) {
    dashboardMonth.setMonth(m);
    dashboardMonth.setYear(y);
  }

  return (
    <div className="flex flex-col gap-4 min-h-full">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <h1 className="text-lg font-bold font-heading tracking-tight">
          Visão geral das suas finanças
        </h1>
        <MonthPicker {...dashboardMonth} onSelect={handleMonthSelect} />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <SummaryCard data={summary ?? undefined} isLoading={loadingSummary} />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-5">
        <RevenueExpenseChart data={chartData} isLoading={loadingChart} />
        <BudgetProgress
          data={budgets}
          label={label}
          isLoading={loadingBudgets}
        />
      </div>

      <RecentAccountTable
        data={accounts}
        label={label}
        isLoading={loadingAccounts}
      />
    </div>
  );
}
