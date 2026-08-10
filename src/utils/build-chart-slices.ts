export type ChartSlice = {
  categoryId: string;
  categoryName: string;
  total: number;
  count: number;
  percentage: number;
};

const DEFAULT_MAX_SLICES = 5;

export function buildChartSlices(
  data: ChartSlice[],
  maxSlices = DEFAULT_MAX_SLICES,
): ChartSlice[] {
  if (data.length <= maxSlices) return data;

  const top = data.slice(0, maxSlices);
  const rest = data.slice(maxSlices);

  return [
    ...top,
    {
      categoryId: "others",
      categoryName: "Outras categorias",
      total: rest.reduce((sum, d) => sum + d.total, 0),
      count: rest.reduce((sum, d) => sum + d.count, 0),
      percentage: rest.reduce((sum, d) => sum + d.percentage, 0),
    },
  ];
}
