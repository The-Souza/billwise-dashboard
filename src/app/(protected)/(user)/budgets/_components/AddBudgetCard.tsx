"use client";

import { Card } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";

interface AddBudgetCardProps {
  label: string;
  categoryType: "expense" | "income";
  onClick: (type: "expense" | "income") => void;
}

export function AddBudgetCard({
  label,
  categoryType,
  onClick,
}: AddBudgetCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onClick(categoryType)}
      onKeyDown={(e) => e.key === "Enter" && onClick(categoryType)}
      className="group flex flex-col items-center justify-center gap-2.5 p-4 border-dashed border-2 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 min-h-36 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25 group-hover:border-primary/50 group-hover:bg-primary/10 transition-all duration-200">
        <PlusIcon className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors duration-200" />
      </div>
      <p className="text-sm text-muted-foreground/70 group-hover:text-muted-foreground text-center leading-snug transition-colors duration-200">
        {label}
      </p>
    </Card>
  );
}
