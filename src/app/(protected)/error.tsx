"use client";

import { AppAlert } from "@/components/ui/app-alert";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-4 max-w-lg">
      <AppAlert
        variant="warning"
        title="Algo deu errado"
        description="Ocorreu um erro inesperado. Tente novamente ou entre em contato com o suporte."
      />
      <Button variant="outline" onClick={reset} className="w-fit">
        Tentar novamente
      </Button>
    </div>
  );
}
