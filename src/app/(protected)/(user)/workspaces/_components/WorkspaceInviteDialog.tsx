"use client";

import { inviteToWorkspaceAction } from "@/actions/(user)/workspaces/invite-to-workspace";
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
import { inviteToWorkspaceSchema } from "@/schemas/workspaces";
import { appToast } from "@/utils/app-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

type EmailValues = { email: string };

interface WorkspaceInviteDialogProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  workspaceId: string;
}

export function WorkspaceInviteDialog({
  open,
  onOpenChange,
  workspaceId,
}: WorkspaceInviteDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting: inviting },
  } = useForm<EmailValues>({
    resolver: zodResolver(inviteToWorkspaceSchema.pick({ email: true })),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: EmailValues) {
    const result = await inviteToWorkspaceAction({
      workspaceId,
      email: values.email,
    });

    if (!result.success) {
      appToast.error(result.error);
      return;
    }

    appToast.success("Convite enviado com sucesso");
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!inviting) {
          if (!o) reset();
          onOpenChange(o);
        }
      }}
    >
      <DialogContent
        className="w-[calc(100vw-2rem)] rounded-md max-w-md"
        aria-describedby={undefined}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Convidar membro</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 pt-2"
        >
          <FieldGroup>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="text-md">
                    Email
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={field.name}
                      {...field}
                      type="email"
                      autoComplete="email"
                      placeholder="email@exemplo.com"
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
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={inviting}
              className="w-full sm:w-auto transition-transform ease-in hover:scale-103 active:scale-97"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={inviting}
              className="w-full sm:w-auto transition-transform ease-in hover:scale-103 active:scale-97"
            >
              {inviting ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Enviando...
                </>
              ) : (
                "Convidar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
