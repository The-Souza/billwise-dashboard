import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-4 min-h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-bold font-heading tracking-tight">
          Dashboard Admin
        </h1>
        <p className="text-sm text-muted-foreground">
          Visão geral do sistema e métricas globais.
        </p>
      </div>

      <Card className="flex-1">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="p-4 rounded-full bg-primary/10">
            <LayoutDashboard className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm font-medium">Em construção</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            O painel administrativo está sendo desenvolvido e estará disponível
            em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
