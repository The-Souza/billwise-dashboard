"use client";

import { getBudgetProgressAction } from "@/actions/(user)/dashboard/get-budget-progress";
import { getChartDataAction } from "@/actions/(user)/dashboard/get-chart-data";
import { getRecentAccountsAction } from "@/actions/(user)/dashboard/get-recent-accounts";
import { getSummaryAction } from "@/actions/(user)/dashboard/get-summary";
import { Button } from "@/components/ui/button";
import { MonthPicker } from "@/components/ui/month-picker";
import { Spinner } from "@/components/ui/spinner";
import { useDashboardMonth } from "@/hooks/use-dashboard-month";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangleIcon } from "lucide-react";
import { BudgetProgress } from "./_components/BudgetProgress";
import { RecentAccountTable } from "./_components/RecentAccountsTable";
import { RevenueExpenseChart } from "./_components/RevenueExpenseChart";
import { SummaryCard } from "./_components/SummaryCard";

export default function DashboardPage() {
  const dashboardMonth = useDashboardMonth();
  const { month, year, label } = dashboardMonth;

  const {
    data: summary,
    isLoading: loadingSummary,
    isError: errorSummary,
    isFetching: fetchingSummary,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ["dashboard-summary", month, year],
    queryFn: async () => {
      const r = await getSummaryAction(month, year);
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });

  const {
    data: chartData,
    isLoading: loadingChart,
    isError: errorChart,
    isFetching: fetchingChart,
    refetch: refetchChart,
  } = useQuery({
    queryKey: ["dashboard-chart", month, year],
    queryFn: async () => {
      const r = await getChartDataAction(month, year, 12);
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });

  const {
    data: budgets,
    isLoading: loadingBudgets,
    isError: errorBudgets,
    isFetching: fetchingBudgets,
    refetch: refetchBudgets,
  } = useQuery({
    queryKey: ["dashboard-budgets", month, year],
    queryFn: async () => {
      const r = await getBudgetProgressAction(month, year);
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });

  const {
    data: accounts,
    isLoading: loadingAccounts,
    isError: errorAccounts,
    isFetching: fetchingAccounts,
    refetch: refetchAccounts,
  } = useQuery({
    queryKey: ["dashboard-accounts", month, year],
    queryFn: async () => {
      const r = await getRecentAccountsAction(month, year);
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });

  const failedCount = [errorSummary, errorChart, errorBudgets, errorAccounts].filter(
    Boolean,
  ).length;
  const retryingAll =
    fetchingSummary || fetchingChart || fetchingBudgets || fetchingAccounts;

  function handleMonthSelect(m: number, y: number) {
    dashboardMonth.setMonth(m);
    dashboardMonth.setYear(y);
  }

  function handleRetryAll() {
    refetchSummary();
    refetchChart();
    refetchBudgets();
    refetchAccounts();
  }

  return (
    <div className="flex flex-col gap-4 min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral das suas finanças.
          </p>
        </div>
        <MonthPicker {...dashboardMonth} onSelect={handleMonthSelect} />
      </div>

      {failedCount >= 2 && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <div className="flex items-center gap-2">
            <AlertTriangleIcon className="h-4 w-4 shrink-0" />
            <span>{failedCount} seções não carregaram nesta página.</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetryAll}
            disabled={retryingAll}
            className="shrink-0 gap-1.5"
          >
            {retryingAll && <Spinner className="h-3.5 w-3.5" />}
            {retryingAll ? "Tentando..." : "Tentar tudo novamente"}
          </Button>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <SummaryCard
          data={summary ?? undefined}
          isLoading={loadingSummary}
          isError={errorSummary}
          isRetrying={fetchingSummary}
          onRetry={refetchSummary}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-5">
        <RevenueExpenseChart
          data={chartData}
          isLoading={loadingChart}
          isError={errorChart}
          isRetrying={fetchingChart}
          onRetry={refetchChart}
        />
        <BudgetProgress
          data={budgets}
          label={label}
          isLoading={loadingBudgets}
          isError={errorBudgets}
          isRetrying={fetchingBudgets}
          onRetry={refetchBudgets}
        />
      </div>

      <RecentAccountTable
        data={accounts}
        label={label}
        isLoading={loadingAccounts}
        isError={errorAccounts}
        isRetrying={fetchingAccounts}
        onRetry={refetchAccounts}
      />
    </div>
  );
}
