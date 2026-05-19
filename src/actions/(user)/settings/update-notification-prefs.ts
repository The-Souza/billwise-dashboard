"use server";

import { requireAuth } from "@/lib/auth/guards";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  NotificationPrefs,
  notificationPrefsSchema,
} from "@/schemas/settings/notification-prefs";
import { revalidatePath } from "next/cache";

type UpdateNotificationPrefsResult =
  | { success: true }
  | { success: false; error: string };

export async function updateNotificationPrefsAction(
  data: NotificationPrefs,
): Promise<UpdateNotificationPrefsResult> {
  try {
    const user = await requireAuth();

    const parsed = notificationPrefsSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }
    const supabase = await createServerSupabase();

    const { error } = await supabase
      .from("profiles")
      .update({ notification_prefs: parsed.data })
      .eq("id", user.id);

    if (error) {
      return { success: false, error: "Erro ao salvar preferências" };
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error in updateNotificationPrefsAction:", error);
    return { success: false, error: "Erro ao salvar preferências de notificação" };
  }
}
