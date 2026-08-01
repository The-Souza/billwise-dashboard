"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

interface QueryErrorStateProps {
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
  className?: string;
}

export function QueryErrorState({
  message = "Não foi possível carregar os dados.",
  onRetry,
  isRetrying,
  className,
}: QueryErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-10 text-center",
        className,
      )}
    >
      <div className="p-3 rounded-full bg-destructive/10">
        <AlertTriangleIcon className="h-5 w-5 text-destructive" />
      </div>
      <p className="text-sm font-medium">{message}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        disabled={isRetrying}
        className="gap-1.5"
      >
        {isRetrying ? (
          <Spinner className="h-3.5 w-3.5" />
        ) : (
          <RefreshCwIcon className="h-3.5 w-3.5" />
        )}
        {isRetrying ? "Tentando..." : "Tentar novamente"}
      </Button>
    </div>
  );
}
