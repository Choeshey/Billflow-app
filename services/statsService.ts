import type { DashboardStats } from "@/lib/types";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [clientCount, invoices] = await Promise.all([
    prisma.client.count({ where: { userId } }),
    prisma.invoice.findMany({
      where: { userId },
      include: { client: { select: { id: true, name: true, company: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const totalRevenue  = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + Number(i.amount), 0);
  const pendingAmount = invoices.filter((i) => i.status === "SENT" || i.status === "DRAFT").reduce((s, i) => s + Number(i.amount), 0);
  const overdueCount  = invoices.filter((i) => i.status === "OVERDUE").length;
  const recentInvoices = invoices.slice(0, 5).map((i) => ({
    id: i.id, amount: i.amount.toString(), status: i.status as DashboardStats["recentInvoices"][number]["status"],
    issueDate: i.issueDate.toISOString(), dueDate: i.dueDate.toISOString(), notes: i.notes,
    userId: i.userId, clientId: i.clientId, client: i.client ?? undefined,
    createdAt: i.createdAt.toISOString(), updatedAt: i.updatedAt.toISOString(),
  }));
  return { totalRevenue, totalClients: clientCount, totalInvoices: invoices.length, overdueCount, pendingAmount, recentInvoices };
}
