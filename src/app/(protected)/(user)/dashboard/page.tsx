import { getBudgetProgressAction } from "@/actions/(user)/dashboard/get-budget-progress";
import { getChartDataAction } from "@/actions/(user)/dashboard/get-chart-data";
import { getRecentAccountsAction } from "@/actions/(user)/dashboard/get-recent-accounts";
import { getSummaryAction } from "@/actions/(user)/dashboard/get-summary";
import { DashboardClient } from "./_components/DashboardClient";

export default async function DashboardPage() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const [summaryResult, chartResult, budgetsResult, accountsResult] =
    await Promise.all([
      getSummaryAction(month, year),
      getChartDataAction(month, year, 12),
      getBudgetProgressAction(month, year),
      getRecentAccountsAction(month, year),
    ]);

  return (
    <DashboardClient
      initialMonth={month}
      initialYear={year}
      initialSummary={summaryResult.success ? summaryResult.data : undefined}
      initialChartData={chartResult.success ? chartResult.data : undefined}
      initialBudgets={budgetsResult.success ? budgetsResult.data : undefined}
      initialAccounts={accountsResult.success ? accountsResult.data : undefined}
    />
  );
}
