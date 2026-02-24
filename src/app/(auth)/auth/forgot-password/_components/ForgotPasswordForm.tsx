"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { appToast } from "@/utils/toast";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "@/schemas/auth/forgot-password";
import Link from "next/link";
import { forgotPasswordAction } from "@/actions/auth/forgot-password";

export function ForgotPasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  async function handleSubmit(data: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await forgotPasswordAction(data);
      if (!result.success) {
        appToast.error(result.error);

        if (result.field)
          form.setError(result.field, {
            type: "manual",
            message: result.error,
          });
        form.reset();
        return;
      }

      appToast.success(
        "Email de redefinição de senha enviado. Verifique sua caixa de entrada.",
      );
      form.reset();
    } catch {
      appToast.error("Algo deu errado. Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <CardHeader className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-heading">Esqueceu sua senha?</h1>
        <p className="text-md text-muted-foreground">
          Insira seu email para redefinir sua senha
        </p>
      </CardHeader>
      <CardContent>
        <form
          id="form-forgot-password"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
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
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Field>
          <Button
            type="submit"
            form="form-forgot-password"
            disabled={!form.formState.isValid || isSubmitting}
            className="flex items-center justify-center gap-2 transition-transform active:scale-[0.97] text-md"
          >
            {isSubmitting ? (
              <>
                <Spinner data-icon="inline-start" />
                Carregando...
              </>
            ) : (
              "Enviar email de redefinição"
            )}
          </Button>
        </Field>

        <Button className="text-md" variant="link" asChild>
          <Link
            href="/auth/sign-in"
            className="text-primary underline-offset-4 hover:underline"
          >
            Voltar para login
          </Link>
        </Button>
      </CardFooter>
    </div>
  );
}
