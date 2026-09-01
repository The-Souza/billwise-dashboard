import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDashboardMonth } from "@/hooks/use-dashboard-month";

describe("useDashboardMonth", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("capitaliza apenas a primeira letra do label, preservando a preposição 'de' em minúsculo", () => {
    vi.setSystemTime(new Date(2026, 6, 15));
    const { result } = renderHook(() => useDashboardMonth());

    expect(result.current.label).toBe("Julho de 2026");
  });

  it("navega para o mês anterior mantendo o label capitalizado corretamente", () => {
    vi.setSystemTime(new Date(2026, 0, 15));
    const { result } = renderHook(() => useDashboardMonth());

    act(() => {
      result.current.prev();
    });

    expect(result.current.label).toBe("Dezembro de 2025");
  });

  it("usa month/year iniciais explícitos em vez da data atual, quando fornecidos", () => {
    vi.setSystemTime(new Date(2026, 6, 15));
    const { result } = renderHook(() => useDashboardMonth(3, 2024));

    expect(result.current.month).toBe(3);
    expect(result.current.year).toBe(2024);
    expect(result.current.label).toBe("Março de 2024");
  });

  it("volta a usar a data atual quando month/year iniciais não são fornecidos", () => {
    vi.setSystemTime(new Date(2026, 6, 15));
    const { result } = renderHook(() => useDashboardMonth());

    expect(result.current.month).toBe(7);
    expect(result.current.year).toBe(2026);
  });
});
