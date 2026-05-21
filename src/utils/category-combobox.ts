export type CategoryComboboxItem = { id: string; name: string };
export type CategoryComboboxGroup = { label: string; items: CategoryComboboxItem[] };

export function buildCategoryGroups(
  expenseItems: CategoryComboboxItem[],
  incomeItems: CategoryComboboxItem[],
): CategoryComboboxGroup[] {
  const groups: CategoryComboboxGroup[] = [];
  if (expenseItems.length > 0) groups.push({ label: "Despesas", items: expenseItems });
  if (incomeItems.length > 0) groups.push({ label: "Receitas", items: incomeItems });
  return groups;
}

export function findCategoryItem(
  groups: CategoryComboboxGroup[],
  id: string | null | undefined,
): CategoryComboboxItem | null {
  if (!id) return null;
  return groups.flatMap((g) => g.items).find((item) => item.id === id) ?? null;
}
