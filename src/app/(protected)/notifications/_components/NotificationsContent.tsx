import { getNotificationsAction } from "@/actions/notifications/get-notifications";
import { NotificationsShell } from "./NotificationsShell";

export async function NotificationsContent() {
  const result = await getNotificationsAction();
  const notifications = result.success ? result.data : [];

  return <NotificationsShell notifications={notifications} />;
}
