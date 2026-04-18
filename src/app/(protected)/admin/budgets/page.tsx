import { Card, CardContent } from "@/components/ui/card";
import { PiggyBank } from "lucide-react";

export default function AdminBudgetsPage() {
  return (
    <div className="flex flex-col gap-4 min-h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-bold font-heading tracking-tight">
          Orçamentos — Admin
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerenciamento global de orçamentos de todos os usuários.
        </p>
      </div>

      <Card className="flex-1">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="p-4 rounded-full bg-primary/10">
            <PiggyBank className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm font-medium">Em construção</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            A visualização administrativa de orçamentos está sendo desenvolvida.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
