"use client";

import { PasswordRequirementsChecklist } from "@/components/auth/PasswordRequirementsChecklist";
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
import { TurnstileField } from "@/components/auth/TurnstileField";

import { appToast } from "@/utils/app-toast";

import { signUpAction } from "@/actions/auth/sign-up";
import { formSchema } from "@/schemas/auth/sign-up";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

export function SignUpForm() {
  const [visibleField, setVisibleField] = useState<
    "password" | "confirmPassword" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | undefined>(
    undefined,
  );
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await signUpAction(data, captchaToken);
      if (!result.success) {
        appToast.error(result.error);

        if (result.field)
          form.setError(result.field, {
            type: "manual",
            message: result.error,
          });

        form.reset({ password: "", confirmPassword: "" });
        return;
      }

      appToast.success("Conta criada com sucesso!");
      form.reset();
      router.replace(
        `/auth/verify-email?email=${encodeURIComponent(data.email)}`,
      );
    } catch {
      appToast.error("Algo deu errado. Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <CardHeader className="flex flex-col items-center gap-2 text-center">
        <CardTitle as="h1" className="text-2xl font-heading">
          Crie sua conta
        </CardTitle>
        <CardDescription className="text-md text-muted-foreground">
          Comece a organizar suas finanças hoje mesmo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-sign-up" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="text-md">
                    Nome Completo
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      type="text"
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid ? `${field.name}-error` : undefined
                      }
                      placeholder="Digite seu nome e sobrenome"
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
                  <FieldLabel htmlFor={field.name} className="text-md">
                    Senha
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      type={visibleField === "password" ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Digite sua senha"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid ? `${field.name}-error` : undefined
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={
                          visibleField === "password"
                            ? "Ocultar senha"
                            : "Mostrar senha"
                        }
                        aria-pressed={visibleField === "password"}
                        size="icon-xs"
                        onClick={() =>
                          setVisibleField((prevState) =>
                            prevState === "password" ? null : "password",
                          )
                        }
                      >
                        {visibleField === "password" ? (
                          <EyeOffIcon />
                        ) : (
                          <EyeIcon />
                        )}
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
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="text-md">
                    Confirmar Senha
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      type={
                        visibleField === "confirmPassword" ? "text" : "password"
                      }
                      autoComplete="new-password"
                      placeholder="Confirme sua senha"
                      aria-invalid={fieldState.invalid}
                      aria-describedby={
                        fieldState.invalid ? `${field.name}-error` : undefined
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={
                          visibleField === "confirmPassword"
                            ? "Ocultar confirmação de senha"
                            : "Mostrar confirmação de senha"
                        }
                        aria-pressed={visibleField === "confirmPassword"}
                        size="icon-xs"
                        onClick={() =>
                          setVisibleField((prevState) =>
                            prevState === "confirmPassword"
                              ? null
                              : "confirmPassword",
                          )
                        }
                      >
                        {visibleField === "confirmPassword" ? (
                          <EyeOffIcon />
                        ) : (
                          <EyeIcon />
                        )}
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
        <div className="mt-6">
          <PasswordRequirementsChecklist
            password={form.watch("password") || ""}
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <TurnstileField
          action="sign-up"
          theme={(resolvedTheme as "dark" | "light") ?? "light"}
          onTokenChange={setCaptchaToken}
        />
        <Field>
          <Button
            type="submit"
            form="form-sign-up"
            disabled={!form.formState.isValid || isSubmitting || !captchaToken}
            className="flex items-center justify-center gap-2 transition-transform ease-in motion-safe:hover:scale-103 motion-safe:active:scale-97 text-md"
          >
            {isSubmitting ? (
              <>
                <Spinner data-icon="inline-start" />
                Carregando...
              </>
            ) : (
              "Criar Conta"
            )}
          </Button>
          {!captchaToken && form.formState.isValid && !isSubmitting && (
            <p className="text-xs text-muted-foreground text-center">
              Aguardando verificação de segurança para habilitar o envio.
            </p>
          )}
        </Field>

        <nav className="flex w-full gap-2 text-md justify-center items-center">
          <CardDescription className="text-foreground">
            Já possui uma conta?
          </CardDescription>
          <Link
            href="/auth/sign-in"
            className="text-primary underline-offset-4 hover:underline"
          >
            Entrar
          </Link>
        </nav>
      </CardFooter>
    </div>
  );
}
