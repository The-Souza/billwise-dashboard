import { computeRecurrenceEndDate } from "@/utils/format-date";
import { describe, expect, it } from "vitest";

describe("computeRecurrenceEndDate", () => {
  it("adiciona 1 mês", () => {
    expect(computeRecurrenceEndDate("2025-01-15", 1)).toBe("2025-02-15");
  });

  it("adiciona 12 meses (1 ano)", () => {
    expect(computeRecurrenceEndDate("2025-01-15", 12)).toBe("2026-01-15");
  });

  it("adiciona 24 meses (2 anos)", () => {
    expect(computeRecurrenceEndDate("2024-03-01", 24)).toBe("2026-03-01");
  });

  it("cruza virada de ano", () => {
    expect(computeRecurrenceEndDate("2025-11-01", 2)).toBe("2026-01-01");
  });

  it("adiciona meses a partir do dia 1", () => {
    expect(computeRecurrenceEndDate("2025-05-01", 3)).toBe("2025-08-01");
  });
});
