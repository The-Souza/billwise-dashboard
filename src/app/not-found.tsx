import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-background">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="p-5 rounded-full bg-muted">
          <FileQuestion className="h-10 w-10 text-muted-foreground opacity-60" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold font-heading tracking-tight">404</h1>
          <h2 className="text-lg font-heading text-foreground">
            Página não encontrada
          </h2>
          <p className="text-sm text-muted-foreground">
            O endereço que você acessou não existe ou foi removido.
          </p>
        </div>

        <Button asChild className="transition-transform ease-in hover:scale-103 active:scale-97">
          <Link href="/dashboard">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  );
}
