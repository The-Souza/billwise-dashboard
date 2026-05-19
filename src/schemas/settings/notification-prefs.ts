import { z } from "zod";

export const notificationPrefsSchema = z.object({
  dueDaysAhead: z.union([
    z.literal(1),
    z.literal(3),
    z.literal(7),
    z.literal(15),
  ]),
  onRecurringGenerated: z.boolean(),
  onBudgetExceeded: z.boolean(),
});

export type NotificationPrefs = z.infer<typeof notificationPrefsSchema>;

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  dueDaysAhead: 3,
  onRecurringGenerated: true,
  onBudgetExceeded: true,
};
