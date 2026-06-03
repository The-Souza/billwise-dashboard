import { formatDateBR } from "@/helper/format-date-br";
import { isValidSecret } from "@/lib/auth/is-valid-secret";
import { prisma } from "@/lib/prisma/client";
import { notificationPrefsSchema } from "@/schemas/settings/notification-prefs";
import { formatCurrency } from "@/utils/format-currency";
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
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // -----------------------------
    // DELETAR NOTIFICAÇÕES COM MAIS DE 30 DIAS
    // -----------------------------

    await prisma.notifications.deleteMany({
      where: {
        created_at: { lt: thirtyDaysAgo },
      },
    });

    // -----------------------------
    // MARCAR COMO OVERDUE
    // -----------------------------

    const overdueAccounts = await prisma.accounts.findMany({
      where: {
        due_date: { lt: today },
        status: "pending",
      },
      select: { id: true, user_id: true, title: true },
    });

    if (overdueAccounts.length > 0) {
      await prisma.accounts.updateMany({
        where: { id: { in: overdueAccounts.map((a) => a.id) } },
        data: { status: "overdue" },
      });

      await prisma.notifications.createMany({
        data: overdueAccounts.map((account) => ({
          user_id: account.user_id,
          title: "Conta vencida",
          body: `A conta "${capitalizeFirst(account.title)}" está vencida.`,
          type: "overdue",
          account_id: account.id,
        })),
        skipDuplicates: true,
      });
    }

    // -----------------------------
    // CARREGAR PREFERÊNCIAS DOS USUÁRIOS
    // Raw SQL para evitar problema de cache do Prisma client em dev
    // -----------------------------

    const profileRows = await prisma.$queryRaw<
      Array<{ id: string; notification_prefs: unknown }>
    >`SELECT id, notification_prefs FROM public.profiles`;

    type UserPrefs = { dueDaysAhead: number; onBudgetExceeded: boolean };
    const userPrefsMap = new Map<string, UserPrefs>();
    for (const profile of profileRows) {
      const parsed = notificationPrefsSchema.safeParse(
        profile.notification_prefs,
      );
      userPrefsMap.set(profile.id, {
        dueDaysAhead: parsed.success ? parsed.data.dueDaysAhead : 3,
        onBudgetExceeded: parsed.success ? parsed.data.onBudgetExceeded : true,
      });
    }

    // -----------------------------
    // NOTIFICAR CONTAS PRESTES A VENCER
    // Respeita a preferência dueDaysAhead de cada usuário (padrão: 3 dias)
    // -----------------------------

    const maxDays =
      userPrefsMap.size > 0
        ? Math.max(
            ...Array.from(userPrefsMap.values()).map((p) => p.dueDaysAhead),
          )
        : 3;
    const maxDaysFromNow = new Date(today);
    maxDaysFromNow.setDate(maxDaysFromNow.getDate() + maxDays);

    const dueSoonCandidates = await prisma.accounts.findMany({
      where: {
        due_date: { gte: today, lte: maxDaysFromNow },
        status: "pending",
      },
      select: { id: true, user_id: true, title: true, due_date: true },
    });

    const dueSoonAccounts = dueSoonCandidates.filter((account) => {
      if (!account.due_date) return false;
      const daysAhead = userPrefsMap.get(account.user_id)?.dueDaysAhead ?? 3;
      const cutoff = new Date(today);
      cutoff.setDate(cutoff.getDate() + daysAhead);
      return account.due_date <= cutoff;
    });

    const newDueSoon = await Promise.all(
      dueSoonAccounts.map(async (account) => {
        const existing = await prisma.notifications.findFirst({
          where: { account_id: account.id, type: "due_soon" },
          select: { id: true },
        });
        return existing ? null : account;
      }),
    ).then((results) => results.filter(Boolean));

    if (newDueSoon.length > 0) {
      await prisma.notifications.createMany({
        data: newDueSoon.map((account) => ({
          user_id: account!.user_id,
          title: "Conta prestes a vencer",
          body: `A conta "${capitalizeFirst(account!.title)}" vence em ${formatDateBR(account!.due_date)}.`,
          type: "due_soon",
          account_id: account!.id,
        })),
      });
    }

    // -----------------------------
    // NOTIFICAR ORÇAMENTOS ULTRAPASSADOS
    // Gastos calculados por workspace_id (contexto compartilhado)
    // Notificação enviada ao criador do orçamento (budget.user_id)
    // -----------------------------

    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const monthStart = new Date(currentYear, today.getMonth(), 1);

    const budgets = await prisma.budgets.findMany({
      where: { month: currentMonth, year: currentYear },
      include: { categories: { select: { id: true, name: true } } },
    });

    let budgetExceededCount = 0;

    if (budgets.length > 0) {
      const workspaceIds = [...new Set(budgets.map((b) => b.workspace_id))];
      const categoryIds = [...new Set(budgets.map((b) => b.category_id))];

      // Soma de gastos por (workspace_id, category_id) no mês atual
      const spendingRows = await prisma.accounts.groupBy({
        by: ["workspace_id", "category_id"],
        where: {
          month: currentMonth,
          year: currentYear,
          workspace_id: { in: workspaceIds },
          category_id: { in: categoryIds },
        },
        _sum: { amount: true },
      });

      const spendingMap = new Map<string, number>();
      for (const row of spendingRows) {
        if (row.category_id) {
          spendingMap.set(
            `${row.workspace_id}:${row.category_id}`,
            Number(row._sum.amount ?? 0),
          );
        }
      }

      // Buscar notificações de orçamento já enviadas este mês para evitar duplicatas
      const notifUserIds = [...new Set(budgets.map((b) => b.user_id))];
      const existingBudgetNotifs = await prisma.notifications.findMany({
        where: {
          type: "budget_exceeded",
          created_at: { gte: monthStart },
          user_id: { in: notifUserIds },
        },
        select: { user_id: true, body: true },
      });

      // Extrair category_id embutido no corpo no formato [...uuid...]
      const alreadyNotified = new Set<string>();
      for (const notif of existingBudgetNotifs) {
        const match = notif.body?.match(
          /\[([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\]$/,
        );
        if (match) alreadyNotified.add(`${notif.user_id}:${match[1]}`);
      }

      const budgetNotifications: Array<{
        user_id: string;
        title: string;
        body: string;
        type: string;
      }> = [];

      for (const budget of budgets) {
        const prefs = userPrefsMap.get(budget.user_id);
        if (!(prefs?.onBudgetExceeded ?? true)) continue;

        const dedupeKey = `${budget.user_id}:${budget.category_id}`;
        if (alreadyNotified.has(dedupeKey)) continue;

        const spent =
          spendingMap.get(`${budget.workspace_id}:${budget.category_id}`) ?? 0;
        const limit = Number(budget.limit_amount);
        if (spent <= limit) continue;

        budgetNotifications.push({
          user_id: budget.user_id,
          title: "Orçamento ultrapassado",
          body: `A categoria "${capitalizeFirst(budget.categories.name)}" ultrapassou o limite. Gasto: ${formatCurrency(spent)} | Limite: ${formatCurrency(limit)}. [${budget.category_id}]`,
          type: "budget_exceeded",
        });
      }

      if (budgetNotifications.length > 0) {
        await prisma.notifications.createMany({ data: budgetNotifications });
        budgetExceededCount = budgetNotifications.length;
      }
    }

    return NextResponse.json({
      success: true,
      overdue: overdueAccounts.length,
      due_soon: newDueSoon.length,
      budget_exceeded: budgetExceededCount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
