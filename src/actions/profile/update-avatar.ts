"use server";

import { requireAuth } from "@/lib/auth/guards";
import { createServerSupabase } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type UpdateAvatarResponse =
  | { success: true }
  | { success: false; error: string };

export async function updateAvatarAction(
  formData: FormData,
): Promise<UpdateAvatarResponse> {
  const user = await requireAuth();
  const supabase = await createServerSupabase();

  const file = formData.get("avatar") as File;

  if (!file || file.size === 0) {
    throw new Error("No file provided");
  }

  const fileExt = file.name.split(".").pop();
  const filePath = `${user.id}/avatar.${fileExt}`;

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
    return { success: false, error: uploadError.message };
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const publicUrlWithTimestamp = `${data.publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrlWithTimestamp })
    .eq("id", user.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return { success: true };
}
