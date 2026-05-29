"use client";

import { getBudgetProgressAction } from "@/actions/(user)/dashboard/get-budget-progress";
import { getChartDataAction } from "@/actions/(user)/dashboard/get-chart-data";
import { getRecentAccountsAction } from "@/actions/(user)/dashboard/get-recent-accounts";
import { getSummaryAction } from "@/actions/(user)/dashboard/get-summary";
import { MonthPicker } from "@/components/ui/month-picker";
import { useDashboardMonth } from "@/hooks/use-dashboard-month";
import { useQuery } from "@tanstack/react-query";
import { BudgetProgress } from "./_components/BudgetProgress";
import { RecentAccountTable } from "./_components/RecentAccountsTable";
import { RevenueExpenseChart } from "./_components/RevenueExpenseChart";
import { SummaryCard } from "./_components/SummaryCard";

export default function DashboardPage() {
  const dashboardMonth = useDashboardMonth();
  const { month, year, label } = dashboardMonth;

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["dashboard-summary", month, year],
    queryFn: () =>
      getSummaryAction(month, year).then((r) => (r.success ? r.data : null)),
  });

  const { data: chartData, isLoading: loadingChart } = useQuery({
    queryKey: ["dashboard-chart", month, year],
    queryFn: () =>
      getChartDataAction(month, year, 12).then((r) =>
        r.success ? r.data : [],
      ),
  });

  const { data: budgets, isLoading: loadingBudgets } = useQuery({
    queryKey: ["dashboard-budgets", month, year],
    queryFn: () =>
      getBudgetProgressAction(month, year).then((r) =>
        r.success ? r.data : [],
      ),
  });

  const { data: accounts, isLoading: loadingAccounts } = useQuery({
    queryKey: ["dashboard-accounts", month, year],
    queryFn: () =>
      getRecentAccountsAction(month, year).then((r) =>
        r.success ? r.data : [],
      ),
  });

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
