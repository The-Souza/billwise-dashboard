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
});
