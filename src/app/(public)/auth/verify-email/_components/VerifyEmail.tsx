"use client";

import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabase } from "@/lib/supabase/client";
import { appToast } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { resendConfirmation } from "@/actions/auth/verify-email";
import Link from "next/link";

interface VerifyEmailProps {
  email?: string;
}

export function VerifyEmail({ email }: VerifyEmailProps) {
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const supabase = createClientSupabase();

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user.email_confirmed_at) router.replace("/dashboard");
    });
    return () => listener.subscription.unsubscribe();
  }, [router, supabase]);

  async function handleResend() {
    if (!email) {
      appToast.error("Email inválido.");
      return;
    }

    if (isResending) return;
    setIsResending(true);

    try {
      const result = await resendConfirmation(email);

      if (!result.success) {
        appToast.error(result.error);
        return;
      }
      appToast.success("Email de confirmação reenviado com sucesso!");
    } catch {
      appToast.error("Não foi possível reenviar o email.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="w-full">
      <CardHeader>
        <CardTitle className="text-4xl font-semibold font-heading text-center">
          Verifique seu email
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-2 text-lg text-center">
        <p className="text-muted-foreground">
          O link de ativação da conta foi enviado para:{" "}
          <span className="font-medium text-primary">
            {email || "seu@email.com"}
          </span>
        </p>
        <p className="text-lg text-muted-foreground">
          Clique no link enviado para ativar sua conta. Se não encontrar o
          email, verifique a caixa de spam.
        </p>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 text-lg text-muted-foreground w-full justify-center">
        <span>
          Não recebeu o email?{" "}
          <Button
            disabled={isResending}
            variant="link"
            onClick={handleResend}
            className="p-0 text-lg"
          >
            {isResending ? "Reenviando..." : "Reenviar"}
          </Button>
        </span>

        <Button
          className="transition-transform active:scale-[0.97] text-md"
          asChild
        >
          <Link href="/auth/sign-in">Voltar para login</Link>
        </Button>
      </CardFooter>
    </div>
  );
}
