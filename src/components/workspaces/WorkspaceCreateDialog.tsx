"use client";

import { createWorkspaceAction } from "@/actions/(user)/workspaces/create-workspace";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { createWorkspaceSchema } from "@/schemas/workspaces";
import { appToast } from "@/utils/app-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";

type FormValues = z.infer<typeof createWorkspaceSchema>;

interface WorkspaceCreateDialogProps {
  open: boolean;
  onClose: () => void;
}

export function WorkspaceCreateDialog({
  open,
  onClose,
}: WorkspaceCreateDialogProps) {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: FormValues) {
    const result = await createWorkspaceAction(values);

    if (!result.success) {
      appToast.error(result.error);
      return;
    }

    appToast.success("Workspace criado com sucesso");
    reset();
    onClose();
    router.refresh();
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      reset();
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Criar workspace</DialogTitle>
          <DialogDescription>
            Adicione um contexto financeiro separado para organizar suas contas.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 pt-2"
        >
          <FieldGroup>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="text-md">
                    Nome
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      placeholder="Ex: Negócios, Casal..."
                      aria-invalid={!!fieldState.error}
                    />
                  </InputGroup>
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Criando...
                </>
              ) : (
                "Criar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
