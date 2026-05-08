"use server";

import { requireAuth } from "@/lib/auth/guards";
import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024;

type UpdateAvatarResponse =
  | { success: true }
  | { success: false; error: string };

export async function updateAvatarAction(
  formData: FormData,
): Promise<UpdateAvatarResponse> {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabase();

    const file = formData.get("avatar");

    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: "Nenhum arquivo enviado" };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { success: false, error: "Formato inválido. Use PNG, JPG ou WebP." };
    }

    if (file.size > MAX_SIZE_BYTES) {
      return { success: false, error: "A imagem deve ter no máximo 2MB" };
    }

    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const filePath = `${user.id}/avatar.${ext}`;

    const { data: existingFiles } = await supabase.storage
      .from("avatars")
      .list(user.id);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map((f) => `${user.id}/${f.name}`);
      await supabase.storage.from("avatars").remove(filesToDelete);
    }

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: "Erro ao fazer upload da imagem." };
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrlWithTimestamp = `${data.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrlWithTimestamp })
      .eq("id", user.id);

    if (updateError) {
      return { success: false, error: "Erro ao salvar foto de perfil." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Error in updateAvatarAction:", error);
    return { success: false, error: "Erro ao processar imagem. Tente novamente." };
  }
}
