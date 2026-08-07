"use client";

import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

import { signInAction } from "@/actions/auth/sign-in";
import { formSchema } from "@/schemas/auth/sign-in";

import { appToast } from "@/utils/app-toast";

import { TURNSTILE_SITE_KEY } from "@/config/turnstile";
import { zodResolver } from "@hookform/resolvers/zod";
import { Turnstile } from "@marsidev/react-turnstile";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

export function SignInForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(
    undefined,
  );
  const [captchaError, setCaptchaError] = useState(false);
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await signInAction(data, captchaToken);

      if (!result.success) {
        form.setError("password", {
          type: "manual",
          message: result.error,
        });

        appToast.error(result.error);

        form.setValue("password", "");
        return;
      }

      appToast.success(`Bem-vindo, ${result.user || "Usuário"}!`);

      form.reset({ email: data.email, password: "" });
      router.replace("/dashboard");
    } catch {
      appToast.error("Algo deu errado. Tente novamente em instantes.");
      form.setValue("password", "");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <CardHeader className="flex flex-col items-center gap-2 text-center">
        <CardTitle as="h1" className="text-2xl font-heading">
          Bem-vindo ao Billwise
        </CardTitle>
        <CardDescription className="text-muted-foreground text-md">
          Gerencie suas finanças de forma simples e inteligente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-sign-in" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="text-md">
                    Email
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      type="email"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid ? `${field.name}-error` : undefined
                      }
                      placeholder="seu@email.com"
                      autoComplete="email"
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="w-full flex justify-between">
                    <FieldLabel htmlFor={field.name} className="text-md">
                      Senha
                    </FieldLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      type={isVisible ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Digite sua senha"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid ? `${field.name}-error` : undefined
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={
                          isVisible ? "Ocultar senha" : "Mostrar senha"
                        }
                        aria-pressed={isVisible}
                        size="icon-xs"
                        onClick={() => setIsVisible((prevState) => !prevState)}
                      >
                        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError
                      id={`${field.name}-error`}
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Turnstile
          siteKey={TURNSTILE_SITE_KEY}
          onSuccess={(token) => {
            setCaptchaError(false);
            setCaptchaToken(token);
          }}
          onExpire={() => setCaptchaToken(undefined)}
          onError={() => {
            setCaptchaToken(undefined);
            setCaptchaError(true);
          }}
          options={{
            theme: (resolvedTheme as "dark" | "light") ?? "light",
            language: "pt-br",
            appearance: "always",
            size: "flexible",
            action: "sign-in",
          }}
        />
        {captchaError && (
          <p className="text-xs text-destructive text-center">
            Não foi possível carregar a verificação de segurança. Recarregue a
            página e tente novamente.
          </p>
        )}
        <Field>
          <Button
            type="submit"
            form="form-sign-in"
            disabled={!form.formState.isValid || isSubmitting || !captchaToken}
            className="flex items-center justify-center gap-2 transition-transform ease-in motion-safe:hover:scale-103 motion-safe:active:scale-97 text-md"
          >
            {isSubmitting ? (
              <>
                <Spinner data-icon="inline-start" />
                Carregando...
              </>
            ) : (
              "Faça login no Billwise"
            )}
          </Button>
        </Field>

        <nav className="flex w-full gap-2 text-md justify-center items-center">
          <CardDescription className="text-foreground">
            Não possui uma conta?
          </CardDescription>
          <Link
            href="/auth/sign-up"
            className="text-primary underline-offset-4 hover:underline"
          >
            Cadastre-se
          </Link>
        </nav>
      </CardFooter>
    </div>
  );
}
