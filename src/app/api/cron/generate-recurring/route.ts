import { prisma } from "@/lib/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");

  if (secret !== process.env.CRON_SECRET) {
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
    });

    let generated = 0;

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

      await prisma.accounts.create({
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
