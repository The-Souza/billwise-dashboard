import { prisma } from "@/lib/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

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
          body: `A conta "${account.title}" está vencida.`,
          type: "overdue",
          account_id: account.id,
        })),
        skipDuplicates: true,
      });
    }

    // -----------------------------
    // NOTIFICAR CONTAS PRESTES A VENCER (3 dias)
    // Evita duplicar notificação já existente para a mesma conta
    // -----------------------------

    const dueSoonAccounts = await prisma.accounts.findMany({
      where: {
        due_date: { gte: today, lte: threeDaysFromNow },
        status: "pending",
      },
      select: { id: true, user_id: true, title: true, due_date: true },
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
          body: `A conta "${account!.title}" vence em ${account!.due_date!.toLocaleDateString("pt-BR")}.`,
          type: "due_soon",
          account_id: account!.id,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      overdue: overdueAccounts.length,
      due_soon: newDueSoon.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
