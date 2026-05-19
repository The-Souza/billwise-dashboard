"use client";

import type { CategoryBreakdownItem } from "@/actions/(user)/analytics/get-category-breakdown";
import { useState } from "react";

type SortKey = "categoryName" | "total" | "count" | "average" | "percentage";
type SortDir = "asc" | "desc";

export const CATEGORY_PAGE_SIZE = 10;

export type { SortDir, SortKey };

export function useCategoryTable(data: CategoryBreakdownItem[]) {
  const [sortKey, setSortKey] = useState<SortKey>("total");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(0);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  }

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    const cmp =
      typeof av === "string"
        ? av.localeCompare(bv as string)
        : (av as number) - (bv as number);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / CATEGORY_PAGE_SIZE);
  const paged = sorted.slice(
    page * CATEGORY_PAGE_SIZE,
    (page + 1) * CATEGORY_PAGE_SIZE,
  );

  return {
    sortKey,
    sortDir,
    page,
    setPage,
    handleSort,
    sorted,
    totalPages,
    paged,
  };
}
