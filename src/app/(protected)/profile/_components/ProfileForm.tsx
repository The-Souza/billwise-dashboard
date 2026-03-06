"use client";

import { removeAvatarAction } from "@/actions/profile/remove-avatar";
import { updateAccountAction } from "@/actions/profile/update-account";
import { updateAvatarAction } from "@/actions/profile/update-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { AuthUser } from "@/lib/auth/getUserWithRole";
import { getInitials } from "@/utils/get-initials";
import { appToast } from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Pencil, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().nonempty("Nome é obrigatório"),
  email: z
    .string()
    .nonempty("Email é obrigatório")
    .email("Email inválido")
    .toLowerCase(),
});

type User = {
  user: AuthUser;
};

export function ProfileForm({ user }: User) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: user.name ?? "",
      email: user.email ?? "",
    },
  });

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      appToast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await updateAvatarAction(formData);

      if (response.success) {
        appToast.success("Foto atualizada com sucesso!");
      } else {
        appToast.error(response.error || "Erro ao subir imagem");
      }
    } catch {
      appToast.error("Erro na conexão com o servidor");
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(data: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await updateAccountAction(data);

      if (!response.success) {
        appToast.error(response.error);
        return;
      }

      appToast.success("Dados atualizados com sucesso");
    } catch {
      appToast.error("Algo deu errado. Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 justify-center items-center h-full w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <Avatar className="h-30 w-30 border-4 border-border">
            {isUploadingAvatar && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                <Spinner className="text-primary size-6" />
              </div>
            )}
            <AvatarImage
              src={user.avatarUrl ?? undefined}
              alt={user.email}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary text-4xl text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <input
            type="file"
            name="avatar"
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
            id="avatar-upload"
            onChange={handleAvatarUpload}
            disabled={isUploadingAvatar}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 z-20 rounded-full shadow-md transition-transform ease-in hover:scale-103 active:scale-97"
              >
                <Pencil />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  Editar Foto
                </label>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-primary hover:bg-primary/20 focus:bg-primary/20 focus:text-primary"
                onClick={async () => {
                  const response = await removeAvatarAction();

                  if (!response.success) {
                    appToast.error(response.message);
                    return;
                  }

                  appToast.success("Foto removida com sucesso");
                }}
              >
                Remover Foto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-heading">Seu Perfil</h2>
          <p className="text-muted-foreground text-md">
            Gerencie suas informações e segurança.
          </p>
        </div>
      </div>

      <div className="grid gap-2 w-full max-w-4xl">
        <CardHeader className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <CardContent className="p-0">
            <CardTitle className="text-md">Dados Pessoais</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Informações básicas da sua conta.
            </CardDescription>
          </CardContent>
          {!isEditing ? (
            <Button
              type="button"
              variant="outline"
              className="transition-transform ease-in hover:scale-103 active:scale-97"
              onClick={() => setIsEditing(true)}
            >
              Editar <Pencil />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="transition-transform ease-in hover:scale-103 active:scale-97"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="form-profile"
                className="transition-transform ease-in hover:scale-103 active:scale-97"
              >
                {isSubmitting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                  </>
                ) : (
                  <>
                    Salvar <Save />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form id="form-profile" onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name} className="text-md">
                      Nome Completo
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type="text"
                        aria-invalid={fieldState.invalid}
                        disabled={!isEditing}
                      />
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
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
                        disabled={!isEditing}
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

        <CardFooter className="flex flex-col gap-2 items-start">
          <CardContent className="p-0">
            <CardTitle className="flex items-center gap-2 text-md">
              <Lock /> Segurança
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Atualize sua senha para manter a conta segura.
            </CardDescription>
          </CardContent>
          <Button variant="outline" asChild>
            <Link
              href="/profile/change-password"
              className="transition-transform ease-in hover:scale-103 active:scale-97"
            >
              Alterar Senha
            </Link>
          </Button>
        </CardFooter>
      </div>
    </div>
  );
}
