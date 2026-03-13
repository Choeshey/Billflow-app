import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-utils";

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

    const counts = await prisma.invoice.groupBy({
      by: ["status"],
      where: { userId: auth.sub },
      _count: { status: true },
    });

    const colorMap: Record<string, string> = {
      PAID: "#10b981",
      SENT: "#3b82f6",
      DRAFT: "#94a3b8",
      OVERDUE: "#ef4444",
    };

    const data = counts.map(c => ({
      name:  c.status.charAt(0) + c.status.slice(1).toLowerCase(),
      value: c._count.status,
      color: colorMap[c.status] ?? "#94a3b8",
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[DASHBOARD STATUSES ERROR]", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
