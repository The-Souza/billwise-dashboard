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

import { appToast } from "@/utils/toast";

import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

export function SignInForm() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleSubmit(data: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await signInAction(data);

      if (!result.success) {
        form.setError("password", {
          type: "manual",
          message: result.error,
        });

        appToast.error(result.error);

        form.setValue("password", "");
        return;
      }

      appToast.success(`Bem vindo!, ${result.user || "Usuário"}`);

      form.reset({ email: data.email, password: "" });
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
        <CardTitle className="text-2xl font-heading">
          Bem-vindo ao Billwise
        </CardTitle>
        <CardDescription className="text-muted-foreground text-md">
          Gerencie suas finanças de forma simples e inteligente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-sign-in" onSubmit={form.handleSubmit(handleSubmit)}>
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
                      placeholder="seu@email.com"
                      autoComplete="on"
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
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
                      placeholder="Digite sua senha"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label="view-password"
                        size="icon-xs"
                        onClick={() => setIsVisible((prevState) => !prevState)}
                      >
                        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Field>
          <Button
            type="submit"
            form="form-sign-in"
            disabled={!form.formState.isValid || isSubmitting}
            className="flex items-center justify-center gap-2 transition-transform ease-in hover:scale-103 active:scale-97 text-md"
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
