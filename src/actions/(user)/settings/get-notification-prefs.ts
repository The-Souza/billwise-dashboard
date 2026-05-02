"use server";

import { requireAuth } from "@/lib/auth/guards";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  DEFAULT_NOTIFICATION_PREFS,
  NotificationPrefs,
  notificationPrefsSchema,
} from "@/schemas/settings/notification-prefs";

export type GetNotificationPrefsResult =
  | { success: true; data: NotificationPrefs }
  | { success: false; error: string };

export async function getNotificationPrefsAction(): Promise<GetNotificationPrefsResult> {
  try {
    const user = await requireAuth();
    const supabase = await createServerSupabase();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("notification_prefs")
      .eq("id", user.id)
      .single();

    if (error || !profile) {
      return { success: false, error: "Perfil não encontrado" };
    }

    const parsed = notificationPrefsSchema.safeParse(
      profile.notification_prefs,
    );

    return {
      success: true,
      data: parsed.success ? parsed.data : DEFAULT_NOTIFICATION_PREFS,
    };
  } catch (error) {
    console.error("Error in getNotificationPrefsAction:", error);
    return { success: false, error: "Erro ao buscar preferências de notificação" };
  }
}
