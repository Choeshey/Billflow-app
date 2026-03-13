import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-utils";

// GET /api/dashboard/revenue — last 6 months revenue data for chart
export async function GET() {
    try {
        const auth = await getAuthUser();
        if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            return { year: d.getFullYear(), month: d.getMonth() };
        });

        const data = await Promise.all(
            months.map(async ({ year, month }) => {
                const start = new Date(year, month, 1);
                const end   = new Date(year, month + 1, 0, 23, 59, 59);
                const agg   = await prisma.invoice.aggregate({
                    where: { userId: auth.sub, status: "PAID", updatedAt: { gte: start, lte: end } },
                    _sum: { amount: true },
                });
                return {
                    month: start.toLocaleString("default", { month: "short" }),
                    revenue: Number(agg._sum.amount ?? 0),
                };
            })
        );

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("[DASHBOARD REVENUE ERROR]", error);
        return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
    }
}
