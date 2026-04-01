"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccountForm } from "./AccountFormContext";

export function AccountFormFooter() {
  const { form, isEditing } = useAccountForm();
  const router = useRouter();

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push("/accounts")}
      >
        Cancelar
      </Button>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <SaveIcon className="h-4 w-4" />
        )}
        {isEditing ? "Salvar alterações" : "Criar conta"}
      </Button>
    </div>
  );
}
