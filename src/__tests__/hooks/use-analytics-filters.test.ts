import { useAnalyticsFilters } from "@/hooks/use-analytics-filters";
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("useAnalyticsFilters", () => {
  it("inicializa com tipo 'all'", () => {
    const { result } = renderHook(() => useAnalyticsFilters());
    expect(result.current.type).toBe("all");
  });

  it("inicializa com startMonth 6 meses antes do mês atual", () => {
    const now = new Date();
    const { result } = renderHook(() => useAnalyticsFilters());
    // verifica que endMonth/endYear refletem o mês atual
    expect(result.current.endMonth).toBe(now.getMonth() + 1);
    expect(result.current.endYear).toBe(now.getFullYear());
  });

  it("setType atualiza o tipo corretamente", () => {
    const { result } = renderHook(() => useAnalyticsFilters());
    act(() => result.current.setType("expense"));
    expect(result.current.type).toBe("expense");
    act(() => result.current.setType("income"));
    expect(result.current.type).toBe("income");
  });

  it("setStart atualiza início sem alterar fim quando início <= fim", () => {
    const { result } = renderHook(() => useAnalyticsFilters());
    const endMonth = result.current.endMonth;
    const endYear = result.current.endYear;

    act(() => result.current.setStart(1, 2024));

    expect(result.current.startMonth).toBe(1);
    expect(result.current.startYear).toBe(2024);
    expect(result.current.endMonth).toBe(endMonth);
    expect(result.current.endYear).toBe(endYear);
  });

  it("setStart avança fim quando início passaria a ser depois do fim", () => {
    const { result } = renderHook(() => useAnalyticsFilters());

    // primeiro define fim para um valor fixo
    act(() => result.current.setEnd(3, 2024));
    // agora define início depois do fim
    act(() => result.current.setStart(6, 2024));

    expect(result.current.startMonth).toBe(6);
    expect(result.current.startYear).toBe(2024);
    expect(result.current.endMonth).toBe(6);
    expect(result.current.endYear).toBe(2024);
  });

  it("setEnd atualiza fim sem alterar início quando fim >= início", () => {
    const { result } = renderHook(() => useAnalyticsFilters());
    act(() => result.current.setStart(1, 2024));
    act(() => result.current.setEnd(6, 2024));

    expect(result.current.endMonth).toBe(6);
    expect(result.current.endYear).toBe(2024);
    expect(result.current.startMonth).toBe(1);
    expect(result.current.startYear).toBe(2024);
  });

  it("setEnd recua início quando fim passaria a ser antes do início", () => {
    const { result } = renderHook(() => useAnalyticsFilters());

    act(() => result.current.setStart(6, 2024));
    act(() => result.current.setEnd(3, 2024));

    expect(result.current.endMonth).toBe(3);
    expect(result.current.endYear).toBe(2024);
    expect(result.current.startMonth).toBe(3);
    expect(result.current.startYear).toBe(2024);
  });

  it("clamp funciona ao cruzar virada de ano", () => {
    const { result } = renderHook(() => useAnalyticsFilters());

    act(() => result.current.setEnd(2, 2025));
    // início em Mar/2025 deve avançar o fim
    act(() => result.current.setStart(5, 2025));

    expect(result.current.startMonth).toBe(5);
    expect(result.current.startYear).toBe(2025);
    expect(result.current.endMonth).toBe(5);
    expect(result.current.endYear).toBe(2025);
  });
});
