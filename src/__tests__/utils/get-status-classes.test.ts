import { describe, expect, it } from "vitest";
import { getStatusClasses } from "@/utils/get-status-classes";

describe("getStatusClasses", () => {
  describe("income", () => {
    it("retorna classes neutras/saudáveis quando percentage >= 50", () => {
      const result = getStatusClasses(50, true);
      expect(result.bar).toBe("bg-foreground/70");
      expect(result.badge).toBe("bg-secondary text-foreground");
    });

    it("retorna classes muted quando percentage < 50", () => {
      const result = getStatusClasses(30, true);
      expect(result.bar).toBe("bg-foreground/70");
      expect(result.badge).toBe("bg-muted text-muted-foreground");
    });
  });

  describe("expense", () => {
    it("retorna classes neutras quando percentage < 70", () => {
      const result = getStatusClasses(50, false);
      expect(result.bar).toBe("bg-foreground/70");
      expect(result.badge).toBe("bg-secondary text-foreground");
    });

    it("retorna tom de destructive atenuado (não primary) quando percentage entre 70 e 90", () => {
      const result = getStatusClasses(80, false);
      expect(result.bar).not.toContain("primary");
      expect(result.badge).not.toContain("primary");
      expect(result.bar).toContain("destructive");
      expect(result.badge).toContain("destructive");
    });

    it("retorna destructive em intensidade máxima quando percentage >= 90", () => {
      const result = getStatusClasses(95, false);
      expect(result.bar).toBe("bg-destructive");
      expect(result.badge).toBe("bg-destructive/10 text-destructive");
    });

    it("diferencia visualmente o tom de warning do tom crítico", () => {
      const warning = getStatusClasses(80, false);
      const critical = getStatusClasses(95, false);
      expect(warning.bar).not.toBe(critical.bar);
    });
  });
});
