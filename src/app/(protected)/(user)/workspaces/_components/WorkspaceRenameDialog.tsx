"use client";

import { renameWorkspaceAction } from "@/actions/(user)/workspaces/rename-workspace";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { renameWorkspaceSchema } from "@/schemas/workspaces";
import { appToast } from "@/utils/app-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

type NameValues = { name: string };

interface WorkspaceRenameDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  workspaceId: string;
  workspaceName: string;
}

export function WorkspaceRenameDialog({
  open,
  onOpenChange,
  workspaceId,
  workspaceName,
}: WorkspaceRenameDialogProps) {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting: renaming },
  } = useForm<NameValues>({
    resolver: zodResolver(renameWorkspaceSchema.pick({ name: true })),
    defaultValues: { name: workspaceName },
  });

  async function onSubmit(values: NameValues) {
    const result = await renameWorkspaceAction({
      workspaceId,
      name: values.name,
    });

    if (!result.success) {
      appToast.error(result.error);
      return;
    }

    appToast.success("Workspace renomeado");
    onOpenChange(false);
    reset({ name: values.name });
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!renaming) onOpenChange(o);
      }}
    >
      <DialogContent
        className="w-[calc(100vw-2rem)] rounded-md max-w-md"
        aria-describedby={undefined}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Renomear workspace</DialogTitle>
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
                    Novo nome
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={field.name}
                      {...field}
                      autoComplete="off"
                      aria-invalid={fieldState.invalid}
                      autoFocus
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={renaming}
              className="w-full sm:w-auto transition-transform ease-in hover:scale-103 active:scale-97"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={renaming}
              className="w-full sm:w-auto transition-transform ease-in hover:scale-103 active:scale-97"
            >
              {renaming ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
