import { isValidSecret } from "@/lib/auth/is-valid-secret";
import { prisma } from "@/lib/prisma/client";
import { notificationPrefsSchema } from "@/schemas/settings/notification-prefs";
import { capitalizeFirst } from "@/utils/format-text";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const secret =
    req.headers.get("authorization")?.replace("Bearer ", "") ?? null;

  if (!isValidSecret(secret, process.env.CRON_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const rules = await prisma.recurring_rules.findMany({
      where: {
        OR: [{ end_date: null }, { end_date: { gte: today } }],
      },
      select: {
        id: true,
        user_id: true,
        title: true,
        amount: true,
        category_id: true,
      },
    });

    let generated = 0;
    const generatedAccounts: Array<{
      accountId: string;
      userId: string;
      title: string;
    }> = [];

    for (const rule of rules) {
      const alreadyExists = await prisma.accounts.findFirst({
        where: {
          recurring_rule_id: rule.id,
          year: currentYear,
          month: currentMonth,
        },
        select: { id: true },
      });

      if (alreadyExists) continue;

      const account = await prisma.accounts.create({
        data: {
          user_id: rule.user_id,
          title: rule.title,
          amount: rule.amount,
          account_date: new Date(currentYear, currentMonth - 1, 1),
          category_id: rule.category_id,
          year: currentYear,
          month: currentMonth,
          status: "pending",
          recurring_rule_id: rule.id,
        },
      });

      generated++;
      generatedAccounts.push({
        accountId: account.id,
        userId: rule.user_id,
        title: rule.title,
      });
    }

    // Notificações em bloco separado — falha aqui não impede a geração
    if (generatedAccounts.length > 0) {
      try {
        const profileRows = await prisma.$queryRaw<
          Array<{ id: string; notification_prefs: unknown }>
        >`SELECT id, notification_prefs FROM public.profiles`;

        const userNotifyMap = new Map<string, boolean>();
        for (const profile of profileRows) {
          const parsed = notificationPrefsSchema.safeParse(
            profile.notification_prefs,
          );
          userNotifyMap.set(
            profile.id,
            parsed.success ? parsed.data.onRecurringGenerated : true,
          );
        }

        const notifications = generatedAccounts
          .filter((a) => userNotifyMap.get(a.userId) ?? true)
          .map((a) => ({
            user_id: a.userId,
            title: "Conta recorrente gerada",
            body: `A conta recorrente "${capitalizeFirst(a.title)}" foi gerada para ${String(currentMonth).padStart(2, "0")}/${currentYear}.`,
            type: "recurring_generated",
            account_id: a.accountId,
          }));

        if (notifications.length > 0) {
          await prisma.notifications.createMany({
            data: notifications,
            skipDuplicates: true,
          });
        }
      } catch (notifError) {
        console.error("Error creating recurring notifications:", notifError);
      }
    }

    return NextResponse.json({ success: true, generated });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
