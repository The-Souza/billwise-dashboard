"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormState } from "react-hook-form";
import { useAccountForm } from "./AccountFormContext";

export function AccountFormFooter() {
  const { form, isEditing } = useAccountForm();
  const { isSubmitting } = useFormState({
    control: form.control,
  });
  const router = useRouter();

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        className="transition-transform ease-in hover:scale-103 active:scale-97"
        onClick={() => router.push("/accounts")}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        className="transition-transform ease-in hover:scale-103 active:scale-97"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <SaveIcon className="h-4 w-4" />
        )}
        {isEditing ? "Salvar alterações" : "Criar conta"}
      </Button>
    </div>
  );
}
