"use client";

import { changePasswordAction } from "@/actions/profile/change-password";
import { Button } from "@/components/ui/button";
import {
  Card,
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
import { formSchema } from "@/schemas/profile/change-password";
import { checkRequirements } from "@/utils/check-requirements";
import { appToast } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Circle, EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

export default function ChangePasswordForm() {
  const [visibleField, setVisibleField] = useState<
    "newPassword" | "confirmNewPassword" | "currentPassword" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const newPasswordValue = form.watch("newPassword") || "";
  const requirements = checkRequirements(newPasswordValue);

  const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
    <li
      className={`flex items-center gap-2 transition-colors duration-300 ${met ? "text-green-500" : "text-muted-foreground"}`}
    >
      {met ? (
        <CheckCircle2 className="size-4" />
      ) : (
        <Circle className="size-4" />
      )}
      <span className="text-sm">{text}</span>
    </li>
  );

  async function handleSubmit(data: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await changePasswordAction(data);

      if (!response.success) {
        if (response.field) {
          form.setError(response.field, { message: response.error });

          if (response.field === "currentPassword") {
            form.setValue("currentPassword", "");
          }
        } else {
          appToast.error(response.error);
        }
        return;
      }

      appToast.success("Senha alterada com sucesso!");
      form.reset();
    } catch {
      appToast.error("Erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full">
      <div className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Alterar Senha</CardTitle>
          <CardDescription className="text-md text-muted-foreground">
            Insira sua senha atual e digite sua nova senha.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <form
            id="form-change-password"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FieldGroup>
              <Controller
                name="currentPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="text-md">
                      Senha Atual
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type={
                          visibleField === "currentPassword"
                            ? "text"
                            : "password"
                        }
                        placeholder="Digite sua senha"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label="view-password"
                          size="icon-xs"
                          onClick={() =>
                            setVisibleField((prevState) =>
                              prevState === "currentPassword"
                                ? null
                                : "currentPassword",
                            )
                          }
                        >
                          {visibleField === "currentPassword" ? (
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
                name="newPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="text-md">
                      Nova Senha
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type={
                          visibleField === "newPassword" ? "text" : "password"
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
                              prevState === "newPassword"
                                ? null
                                : "newPassword",
                            )
                          }
                        >
                          {visibleField === "newPassword" ? (
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
                name="confirmNewPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="text-md">
                      Confirmar Nova Senha
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type={
                          visibleField === "confirmNewPassword"
                            ? "text"
                            : "password"
                        }
                        placeholder="Confirme sua nova senha"
                        aria-invalid={fieldState.invalid}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label="view-password"
                          size="icon-xs"
                          onClick={() =>
                            setVisibleField((prevState) =>
                              prevState === "confirmNewPassword"
                                ? null
                                : "confirmNewPassword",
                            )
                          }
                        >
                          {visibleField === "confirmNewPassword" ? (
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
          <Card className="p-4 flex flex-col gap-2">
            <CardHeader className="p-0">
              <CardTitle className="text-sm font-medium">
                Requisitos da nova senha:
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="grid grid-cols-1 gap-2">
                <RequirementItem
                  met={requirements.minChar}
                  text="No mínimo 6 caracteres"
                />
                <RequirementItem
                  met={requirements.upperCase}
                  text="Uma letra maiúscula"
                />
                <RequirementItem
                  met={requirements.number}
                  text="Pelo menos um número"
                />
                <RequirementItem
                  met={requirements.specialChar}
                  text="Um caractere especial"
                />
              </ul>
            </CardContent>
          </Card>
        </CardContent>
        <CardFooter>
          <Field>
            <Button
              type="submit"
              form="form-change-password"
              disabled={!form.formState.isValid || isSubmitting}
              className="flex items-center justify-center gap-2 transition-transform ease-in hover:scale-103 active:scale-97 text-md"
            >
              {isSubmitting ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Carregando...
                </>
              ) : (
                "Mudar Senha"
              )}
            </Button>
          </Field>
        </CardFooter>
      </div>
    </div>
  );
}
