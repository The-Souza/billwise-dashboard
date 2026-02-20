"use client";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import { appToast } from "@/utils/toast";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { formSchema } from "@/schemas/auth/update-password";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updatePasswordAction } from "@/actions/auth/update-password";

export function UpdatePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleField, setVisibleField] = useState<
    "password" | "confirmPassword" | null
  >(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function handleSubmit(data: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await updatePasswordAction(data);

      if (!result.success) {
        appToast.error(result.error);
        return;
      }

      appToast.success("Senha atualizada com sucesso!");
      router.replace("/auth/sign-in");
    } catch {
      appToast.error("Algo deu errado. Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <CardHeader className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-heading">Redefinir senha</h1>
        <p className="text-md text-muted-foreground">Insira sua nova senha para atualizar a segurança da sua conta</p>
      </CardHeader>
      <CardContent>
        <form
          id="form-update-password"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <FieldGroup>
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
                      placeholder="Digite sua senha"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label="view-password"
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
                    <FieldError errors={[fieldState.error]} />
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
                      placeholder="Confirme sua senha"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label="view-password"
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
            form="form-update-password"
            disabled={!form.formState.isValid || isSubmitting}
            className="flex items-center justify-center gap-2 transition-transform active:scale-[0.97] text-md"
          >
            {isSubmitting ? (
              <>
                <Spinner data-icon="inline-start" />
                Carregando...
              </>
            ) : (
              "Mudar senha"
            )}
          </Button>
        </Field>

        <nav className="flex w-full gap-2 text-md justify-center items-center">
          <Link
            href="/auth/sign-in"
            className="text-primary underline-offset-4 hover:underline"
          >
            Voltar para login
          </Link>
        </nav>
      </CardFooter>
    </div>
  );
}
