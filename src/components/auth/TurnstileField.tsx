"use client";

import { Button } from "@/components/ui/button";
import { TURNSTILE_SITE_KEY } from "@/config/turnstile";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef, useState } from "react";

interface TurnstileFieldProps {
  action: string;
  theme: "light" | "dark";
  onTokenChange: (token: string | undefined) => void;
}

export function TurnstileField({
  action,
  theme,
  onTokenChange,
}: TurnstileFieldProps) {
  const [hasError, setHasError] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  function handleRetry() {
    setHasError(false);
    onTokenChange(undefined);
    turnstileRef.current?.reset();
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <Turnstile
        ref={turnstileRef}
        siteKey={TURNSTILE_SITE_KEY}
        onSuccess={(token) => {
          setHasError(false);
          onTokenChange(token);
        }}
        onExpire={() => {
          onTokenChange(undefined);
          turnstileRef.current?.reset();
        }}
        onError={() => {
          onTokenChange(undefined);
          setHasError(true);
        }}
        options={{
          theme,
          language: "pt-br",
          appearance: "always",
          size: "flexible",
          action,
        }}
      />
      {hasError && (
        <div className="flex flex-col items-center gap-1.5">
          <p className="text-xs text-destructive text-center">
            Não foi possível carregar a verificação de segurança.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRetry}
          >
            Tentar novamente
          </Button>
        </div>
      )}
    </div>
  );
}
