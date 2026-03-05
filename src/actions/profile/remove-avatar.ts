"use server";

import { requireAuth } from "@/lib/auth/guards";
import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type RemoveAvatarResponse =
  | { success: true }
  | { success: false; message: string };

export async function removeAvatarAction(): Promise<RemoveAvatarResponse> {
  const user = await requireAuth();
  const supabase = await createServerSupabase();

  const { data: files, error: listError } = await supabase.storage
    .from("avatars")
    .list(user.id);

  if (listError || !files) {
    return { success: false, message: "Erro ao localizar arquivos de avatar." };
  }

  const filesToDelete = files
    .filter((file) => file.name.startsWith("avatar."))
    .map((file) => `${user.id}/${file.name}`);

  if (filesToDelete.length > 0) {
    const { error: deleteError } = await supabase.storage
      .from("avatars")
      .remove(filesToDelete);

    if (deleteError) {
      return { success: false, message: deleteError.message };
    }
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (updateError) {
    return { success: false, message: updateError.message };
  }

  revalidatePath("/dashboard");

  return { success: true };
}
