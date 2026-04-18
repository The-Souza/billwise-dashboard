import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function AdminAccountsPage() {
  return (
    <div className="flex flex-col gap-4 min-h-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-bold font-heading tracking-tight">
          Contas — Admin
        </h1>
        <p className="text-sm text-muted-foreground">
          Gerenciamento global de contas de todos os usuários.
        </p>
      </div>

      <Card className="flex-1">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="p-4 rounded-full bg-primary/10">
            <CreditCard className="h-8 w-8 text-primary" />
          </div>
          <p className="text-sm font-medium">Em construção</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            A visualização administrativa de contas está sendo desenvolvida.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
