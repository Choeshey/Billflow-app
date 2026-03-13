import { NextResponse }   from "next/server";
import { prisma }         from "@/lib/prisma";
import { getAuthUser }    from "@/lib/server-utils";
import type { ApiResponse, DashboardStats } from "@/lib/types";

export async function GET(): Promise<NextResponse<ApiResponse<DashboardStats>>> {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

  const userId = auth.sub;

  const [paidInvoices, activeCount, overdueRows, clientCount, recent] =
    await Promise.all([
      prisma.invoice.aggregate({ where: { userId, status: "PAID" }, _sum: { amount: true } }),
      prisma.invoice.count({ where: { userId, status: { in: ["DRAFT", "SENT"] } } }),
      prisma.invoice.aggregate({ where: { userId, status: "OVERDUE" }, _sum: { amount: true } }),
      prisma.client.count({ where: { userId } }),
      prisma.invoice.findMany({
        where: { userId }, orderBy: { createdAt: "desc" }, take: 5,
        include: { client: { select: { id: true, name: true } } },
      }),
    ]);

  const stats: DashboardStats = {
    totalRevenue:   parseFloat(String(paidInvoices._sum.amount ?? 0)),
    activeInvoices: activeCount,
    overdueAmount:  parseFloat(String(overdueRows._sum.amount ?? 0)),
    totalClients:   clientCount,
    recentInvoices: recent.map((r) => ({
      id: r.id, amount: parseFloat(r.amount.toString()),
      status: r.status, issueDate: r.issueDate.toISOString(),
      dueDate: r.dueDate.toISOString(), notes: r.notes,
      createdAt: r.createdAt.toISOString(), client: r.client,
    })),
  };

  return NextResponse.json({ success: true, data: stats });
}
