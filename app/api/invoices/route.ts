import { NextResponse, type NextRequest } from "next/server";
import type { ApiResponse, Invoice } from "@/lib/types";
import { getAuthUser } from "@/lib/server-utils";
import { prisma } from "@/lib/prisma";
import { canCreateInvoice } from "@/lib/plan";

// GET /api/invoices
export async function GET(): Promise<NextResponse<ApiResponse<Invoice[]>>> {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

    const invoices = await prisma.invoice.findMany({
      where:   { userId: auth.sub },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });

    const data: Invoice[] = invoices.map((inv) => ({
      id:        inv.id,
      amount:    Number(inv.amount),
      status:    inv.status as Invoice["status"],
      issueDate: inv.issueDate.toISOString(),
      dueDate:   inv.dueDate.toISOString(),
      notes:     inv.notes ?? null,
      userId:    inv.userId,
      clientId:  inv.clientId,
      client:    { id: inv.client.id, name: inv.client.name },
      createdAt: inv.createdAt.toISOString(),
      updatedAt: inv.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[INVOICES GET ERROR]", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

// POST /api/invoices — enforces plan limits
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Invoice>>> {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

    // ── Plan limit check ───────────────────────────────────────────────────
    const { allowed, reason } = await canCreateInvoice(auth.sub);
    if (!allowed) {
      return NextResponse.json(
          { success: false, error: reason, code: "PLAN_LIMIT_REACHED" },
          { status: 403 }
      );
    }

    let body: unknown;
    try { body = await request.json(); }
    catch { return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 }); }

    const { amount, status, dueDate, clientId, notes } = body as Record<string, unknown>;

    if (!amount || !dueDate || !clientId) {
      return NextResponse.json({ success: false, error: "amount, dueDate, clientId are required." }, { status: 422 });
    }

    const invoice = await prisma.invoice.create({
      data: {
        amount:   Number(amount),
        status:   (status as string) ?? "DRAFT",
        dueDate:  new Date(dueDate as string),
        notes:    (notes as string) ?? null,
        userId:   auth.sub,
        clientId: clientId as string,
      },
      include: { client: true },
    });

    const data: Invoice = {
      id:        invoice.id,
      amount:    Number(invoice.amount),
      status:    invoice.status as Invoice["status"],
      issueDate: invoice.issueDate.toISOString(),
      dueDate:   invoice.dueDate.toISOString(),
      notes:     invoice.notes ?? null,
      userId:    invoice.userId,
      clientId:  invoice.clientId,
      client:    { id: invoice.client.id, name: invoice.client.name },
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString(),
    };

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("[INVOICES POST ERROR]", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
