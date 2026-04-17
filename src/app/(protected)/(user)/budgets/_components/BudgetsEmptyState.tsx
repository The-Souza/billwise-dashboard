import { Button } from "@/components/ui/button";
import { WalletIcon } from "lucide-react";

interface BudgetsEmptyStateProps {
  onCreateClick: () => void;
}

export function BudgetsEmptyState({ onCreateClick }: BudgetsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
      <WalletIcon className="h-10 w-10 opacity-30" />
      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-medium text-foreground">
          Nenhum orçamento definido
        </p>
        <p className="text-sm text-center">
          Crie um orçamento para acompanhar seus gastos neste mês.
        </p>
      </div>
      <Button size="sm" onClick={onCreateClick}>
        Criar primeiro orçamento
      </Button>
    </div>
  );
}
