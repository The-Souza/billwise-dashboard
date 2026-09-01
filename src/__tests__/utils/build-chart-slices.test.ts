import { describe, expect, it } from "vitest";
import { buildChartSlices, type ChartSlice } from "@/utils/build-chart-slices";

function makeSlice(overrides: Partial<ChartSlice> = {}): ChartSlice {
  return {
    categoryId: "cat-1",
    categoryName: "Categoria",
    total: 100,
    count: 1,
    percentage: 10,
    ...overrides,
  };
}

describe("buildChartSlices", () => {
  it("retorna array vazio para entrada vazia", () => {
    expect(buildChartSlices([])).toEqual([]);
  });

  it("retorna os dados inalterados quando há 5 ou menos categorias", () => {
    const data = Array.from({ length: 5 }, (_, i) =>
      makeSlice({ categoryId: `cat-${i}` }),
    );
    expect(buildChartSlices(data)).toEqual(data);
  });

  it("não agrega quando há exatamente o limite de categorias", () => {
    const data = Array.from({ length: 5 }, (_, i) =>
      makeSlice({ categoryId: `cat-${i}` }),
    );
    const result = buildChartSlices(data);
    expect(result).toHaveLength(5);
    expect(result.some((s) => s.categoryId === "others")).toBe(false);
  });

  it("agrega categorias além do limite em uma fatia 'Outros'", () => {
    const data = [
      makeSlice({ categoryId: "cat-0", total: 500, count: 5, percentage: 50 }),
      makeSlice({ categoryId: "cat-1", total: 200, count: 2, percentage: 20 }),
      makeSlice({ categoryId: "cat-2", total: 100, count: 1, percentage: 10 }),
      makeSlice({ categoryId: "cat-3", total: 80, count: 1, percentage: 8 }),
      makeSlice({ categoryId: "cat-4", total: 70, count: 1, percentage: 7 }),
      makeSlice({ categoryId: "cat-5", total: 30, count: 1, percentage: 3 }),
      makeSlice({ categoryId: "cat-6", total: 20, count: 1, percentage: 2 }),
    ];

    const result = buildChartSlices(data);

    expect(result).toHaveLength(6);
    expect(result.slice(0, 5).map((s) => s.categoryId)).toEqual([
      "cat-0",
      "cat-1",
      "cat-2",
      "cat-3",
      "cat-4",
    ]);

    const others = result[5];
    expect(others.categoryId).toBe("others");
    expect(others.categoryName).toBe("Outras categorias");
    expect(others.total).toBe(50);
    expect(others.count).toBe(2);
    expect(others.percentage).toBeCloseTo(5);
  });

  it("agrega um único item excedente em 'Outros' quando há exatamente limite+1", () => {
    const data = Array.from({ length: 6 }, (_, i) =>
      makeSlice({ categoryId: `cat-${i}`, total: 10, count: 1, percentage: 10 }),
    );

    const result = buildChartSlices(data);

    expect(result).toHaveLength(6);
    expect(result[5]).toMatchObject({
      categoryId: "others",
      categoryName: "Outras categorias",
      total: 10,
      count: 1,
      percentage: 10,
    });
  });

  it("mantém categoryId 'others' como discriminador mesmo se uma categoria real se chamar 'Outras categorias'", () => {
    const data = [
      makeSlice({ categoryId: "cat-0", categoryName: "Outras categorias" }),
      makeSlice({ categoryId: "cat-1" }),
      makeSlice({ categoryId: "cat-2" }),
      makeSlice({ categoryId: "cat-3" }),
      makeSlice({ categoryId: "cat-4" }),
      makeSlice({ categoryId: "cat-5" }),
    ];

    const result = buildChartSlices(data);

    expect(result[0]).toMatchObject({
      categoryId: "cat-0",
      categoryName: "Outras categorias",
    });
    expect(result[5]).toMatchObject({
      categoryId: "others",
      categoryName: "Outras categorias",
    });
  });

  it("respeita um maxSlices customizado", () => {
    const data = Array.from({ length: 4 }, (_, i) =>
      makeSlice({ categoryId: `cat-${i}`, total: 10, count: 1, percentage: 25 }),
    );

    const result = buildChartSlices(data, 2);

    expect(result).toHaveLength(3);
    expect(result[2]).toMatchObject({
      categoryId: "others",
      total: 20,
      count: 2,
      percentage: 50,
    });
  });
});
