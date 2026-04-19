import { parseDateLocal, parseDateParts } from "@/helper/parse-date";
import { describe, expect, it } from "vitest";

describe("parseDateParts", () => {
  it("extrai ano, mês e dia corretamente", () => {
    const result = parseDateParts("2026-04-19");
    expect(result.year).toBe(2026);
    expect(result.month).toBe(4);
    expect(result.day).toBe(19);
  });

  it("retorna um objeto Date válido", () => {
    const { date } = parseDateParts("2026-01-15");
    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(0); // Janeiro = 0
    expect(date.getDate()).toBe(15);
  });

  it("interpreta mês corretamente (sem offset)", () => {
    const { date } = parseDateParts("2026-12-31");
    expect(date.getMonth()).toBe(11); // Dezembro = 11
    expect(date.getDate()).toBe(31);
  });
});

describe("parseDateLocal", () => {
  it("retorna um Date equivalente ao parseDateParts", () => {
    const dateStr = "2026-06-15";
    const result = parseDateLocal(dateStr);
    const { date } = parseDateParts(dateStr);
    expect(result.getTime()).toBe(date.getTime());
  });
});
