"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangleIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="p-5 rounded-full bg-destructive/10">
          <AlertTriangleIcon className="h-10 w-10 text-destructive opacity-80" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-heading text-foreground">
            Algo deu errado
          </h2>
          <p className="text-sm text-muted-foreground">
            Ocorreu um erro inesperado. Tente novamente ou volte ao início.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={reset}>
            Tentar novamente
          </Button>
          <Button asChild>
            <Link href="/dashboard">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
