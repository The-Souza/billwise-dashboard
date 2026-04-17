"use client";

import { Card } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";

interface AddBudgetCardProps {
  label: string;
  categoryType: "expense" | "income";
  onClick: (type: "expense" | "income") => void;
}

export function AddBudgetCard({ label, categoryType, onClick }: AddBudgetCardProps) {
  return (
    <Card
      onClick={() => onClick(categoryType)}
      className="flex flex-col items-center justify-center gap-2 p-4 border-dashed border-2 cursor-pointer hover:bg-muted/50 hover:border-muted-foreground/30 transition-colors min-h-36"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/25">
        <PlusIcon className="h-4 w-4 text-muted-foreground/50" />
      </div>
      <p className="text-sm text-muted-foreground/70 text-center leading-snug">
        {label}
      </p>
    </Card>
  );
}
