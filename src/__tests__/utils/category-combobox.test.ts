import { describe, expect, it } from "vitest";
import {
  buildCategoryGroups,
  findCategoryItem,
} from "@/utils/category-combobox";

const expense = [
  { id: "e1", name: "Alimentação" },
  { id: "e2", name: "Transporte" },
];
const income = [
  { id: "i1", name: "Salário" },
  { id: "i2", name: "Freelance" },
];

describe("buildCategoryGroups", () => {
  it("retorna dois grupos quando ambos os arrays são não-vazios", () => {
    const groups = buildCategoryGroups(expense, income);
    expect(groups).toHaveLength(2);
    expect(groups[0].label).toBe("Despesas");
    expect(groups[0].items).toEqual(expense);
    expect(groups[1].label).toBe("Receitas");
    expect(groups[1].items).toEqual(income);
  });

  it("retorna apenas o grupo de despesas quando receitas está vazio", () => {
    const groups = buildCategoryGroups(expense, []);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Despesas");
  });

  it("retorna apenas o grupo de receitas quando despesas está vazio", () => {
    const groups = buildCategoryGroups([], income);
    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe("Receitas");
  });

  it("retorna array vazio quando ambos os arrays são vazios", () => {
    const groups = buildCategoryGroups([], []);
    expect(groups).toHaveLength(0);
  });

  it("preserva a ordem dos itens dentro de cada grupo", () => {
    const groups = buildCategoryGroups(expense, income);
    expect(groups[0].items[0].id).toBe("e1");
    expect(groups[0].items[1].id).toBe("e2");
    expect(groups[1].items[0].id).toBe("i1");
  });
});

describe("findCategoryItem", () => {
  const groups = buildCategoryGroups(expense, income);

  it("retorna o item correspondente quando o id está nas despesas", () => {
    expect(findCategoryItem(groups, "e1")).toEqual({ id: "e1", name: "Alimentação" });
  });

  it("retorna o item correspondente quando o id está nas receitas", () => {
    expect(findCategoryItem(groups, "i2")).toEqual({ id: "i2", name: "Freelance" });
  });

  it("retorna null quando o id não é encontrado", () => {
    expect(findCategoryItem(groups, "x999")).toBeNull();
  });

  it("retorna null quando o id é null", () => {
    expect(findCategoryItem(groups, null)).toBeNull();
  });

  it("retorna null quando o id é undefined", () => {
    expect(findCategoryItem(groups, undefined)).toBeNull();
  });

  it("retorna null quando o id é string vazia", () => {
    expect(findCategoryItem(groups, "")).toBeNull();
  });

  it("retorna null quando os grupos estão vazios", () => {
    expect(findCategoryItem([], "e1")).toBeNull();
  });
});
