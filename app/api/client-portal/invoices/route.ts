import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthClient } from "@/lib/client-server-utils";

// GET /api/client-portal/invoices — get invoices for logged-in client
export async function GET() {
    try {
        const client = await getAuthClient();
        if (!client) {
            return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });
        }

        const invoices = await prisma.invoice.findMany({
            where:   { clientId: client.sub, userId: client.adminId },
            orderBy: { createdAt: "desc" },
            select: {
                id:        true,
                amount:    true,
                status:    true,
                issueDate: true,
                dueDate:   true,
                notes:     true,
                createdAt: true,
            },
        });

        // Calculate total owed (unpaid invoices)
        const totalOwed = invoices
            .filter(i => i.status === "SENT" || i.status === "OVERDUE")
            .reduce((s, i) => s + Number(i.amount), 0);

        const totalPaid = invoices
            .filter(i => i.status === "PAID")
            .reduce((s, i) => s + Number(i.amount), 0);

        return NextResponse.json({
            success: true,
            data: {
                invoices: invoices.map(i => ({
                    ...i,
                    amount:    Number(i.amount),
                    issueDate: i.issueDate.toISOString(),
                    dueDate:   i.dueDate.toISOString(),
                    createdAt: i.createdAt.toISOString(),
                })),
                summary: { totalOwed, totalPaid, total: invoices.length },
            },
        });
    } catch (error) {
        console.error("[CLIENT PORTAL INVOICES ERROR]", error);
        return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
    }
}
