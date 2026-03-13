import { NextResponse, type NextRequest } from "next/server";
import { prisma }      from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-utils";
import type { ApiResponse, Invoice, InvoiceStatus } from "@/lib/types";

interface Params { params: Promise<{ id: string }> }

const VALID_STATUSES: InvoiceStatus[] = ["DRAFT", "SENT", "PAID", "OVERDUE"];

function toInvoice(r: {
  id: string; amount: { toString(): string }; status: string;
  issueDate: Date; dueDate: Date; notes: string | null; createdAt: Date;
  client: { id: string; name: string };
}): Invoice {
  return {
    id: r.id, amount: parseFloat(r.amount.toString()),
    status: r.status as InvoiceStatus,
    issueDate: r.issueDate.toISOString(), dueDate: r.dueDate.toISOString(),
    notes: r.notes, createdAt: r.createdAt.toISOString(),
    client: r.client,
  };
}

// PATCH /api/invoices/[id] — update status
export async function PATCH(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<Invoice>>> {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.sub) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 });
  }

  const { status } = body as Record<string, unknown>;
  if (!VALID_STATUSES.includes(status as InvoiceStatus)) {
    return NextResponse.json({ success: false, error: "Invalid status." }, { status: 422 });
  }

  const updated = await prisma.invoice.update({
    where:   { id },
    data:    { status: status as InvoiceStatus },
    include: { client: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ success: true, data: toInvoice(updated) });
}

// DELETE /api/invoices/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<null>>> {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.invoice.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.sub) {
    return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  }

  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true, data: null });
}
