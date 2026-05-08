"use client";

import { getAnalyticsEvolutionAction } from "@/actions/(user)/analytics/get-analytics-evolution";
import { getAnalyticsSummaryAction } from "@/actions/(user)/analytics/get-analytics-summary";
import { getCategoryBreakdownAction } from "@/actions/(user)/analytics/get-category-breakdown";
import { useAnalyticsFilters } from "@/hooks/use-analytics-filters";
import useSWR from "swr";
import { AnalyticsFilters } from "./_components/AnalyticsFilters";
import { AnalyticsSummaryCards } from "./_components/AnalyticsSummaryCards";
import { CategoryBreakdownChart } from "./_components/CategoryBreakdownChart";
import { CategoryTable } from "./_components/CategoryTable";
import { EvolutionChart } from "./_components/EvolutionChart";

export default function AnalyticsPage() {
  const filters = useAnalyticsFilters();
  const { startMonth, startYear, endMonth, endYear, type } = filters;

  const summaryKey = [
    "analytics-summary",
    startMonth,
    startYear,
    endMonth,
    endYear,
  ];
  const { data: summaryResult, isLoading: summaryLoading } = useSWR(
    summaryKey,
    () => getAnalyticsSummaryAction(startMonth, startYear, endMonth, endYear),
  );

  const breakdownKey = [
    "analytics-breakdown",
    startMonth,
    startYear,
    endMonth,
    endYear,
    type,
  ];
  const { data: breakdownResult, isLoading: breakdownLoading } = useSWR(
    breakdownKey,
    () =>
      getCategoryBreakdownAction(
        startMonth,
        startYear,
        endMonth,
        endYear,
        type,
      ),
  );

  const evolutionKey = [
    "analytics-evolution",
    startMonth,
    startYear,
    endMonth,
    endYear,
  ];
  const { data: evolutionResult, isLoading: evolutionLoading } = useSWR(
    evolutionKey,
    () => getAnalyticsEvolutionAction(startMonth, startYear, endMonth, endYear),
  );

  const summary = summaryResult?.success ? summaryResult.data : undefined;
  const breakdown = breakdownResult?.success ? breakdownResult.data : undefined;
  const evolution = evolutionResult?.success ? evolutionResult.data : undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold">Análises</h1>
        <p className="text-sm text-muted-foreground">
          Visualize a distribuição e evolução das suas finanças por período.
        </p>
      </div>

      <AnalyticsFilters filters={filters} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AnalyticsSummaryCards data={summary} isLoading={summaryLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <EvolutionChart data={evolution} isLoading={evolutionLoading} />
        <CategoryBreakdownChart data={breakdown} isLoading={breakdownLoading} />
      </div>

      <CategoryTable data={breakdown} isLoading={breakdownLoading} />
    </div>
  );
}
