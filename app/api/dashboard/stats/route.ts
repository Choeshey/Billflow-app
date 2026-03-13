import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-utils";

// GET /api/dashboard/stats
export async function GET() {
    try {
        const auth = await getAuthUser();
        if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

        const userId = auth.sub;
        const now    = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLast  = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLast    = new Date(now.getFullYear(), now.getMonth(), 0);

        const [
            allPaidInvoices,
            totalClients,
            unpaidInvoices,
            paidThisMonth,
            paidLastMonth,
            clientsThisMonth,
            clientsLastMonth,
        ] = await Promise.all([
            prisma.invoice.findMany({
                where: { userId, status: "PAID" },
                select: { amount: true },
            }),
            prisma.client.count({ where: { userId } }),
            prisma.invoice.count({ where: { userId, status: { in: ["SENT", "DRAFT", "OVERDUE"] } } }),
            prisma.invoice.aggregate({
                where: { userId, status: "PAID", updatedAt: { gte: startOfMonth } },
                _sum: { amount: true },
            }),
            prisma.invoice.aggregate({
                where: { userId, status: "PAID", updatedAt: { gte: startOfLast, lte: endOfLast } },
                _sum: { amount: true },
            }),
            prisma.client.count({ where: { userId, createdAt: { gte: startOfMonth } } }),
            prisma.client.count({ where: { userId, createdAt: { gte: startOfLast, lte: endOfLast } } }),
        ]);

        const totalRevenue   = allPaidInvoices.reduce((s, i) => s + Number(i.amount), 0);
        const thisMonthRev   = Number(paidThisMonth._sum.amount ?? 0);
        const lastMonthRev   = Number(paidLastMonth._sum.amount ?? 0);
        const revenueChange  = lastMonthRev === 0 ? 100 : Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100);
        const clientChange   = clientsLastMonth === 0 ? 100 : Math.round(((clientsThisMonth - clientsLastMonth) / clientsLastMonth) * 100);

        return NextResponse.json({
            success: true,
            data: {
                totalRevenue,
                totalClients,
                unpaidInvoices,
                paidThisMonth: thisMonthRev,
                revenueChange,
                clientChange,
            },
        });
    } catch (error) {
        console.error("[DASHBOARD STATS ERROR]", error);
        return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
    }
}
