import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthClient } from "@/lib/client-server-utils";

// GET /api/client-portal/invoices/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const client = await getAuthClient();
    if (!client) {
      return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });
    }

    const { id } = await params;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        clientId: client.sub,
        userId:   client.adminId,
      },
      include: {
        client: {
          select: { name: true, email: true, company: true },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ success: false, error: "Invoice not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id:        invoice.id,
        amount:    Number(invoice.amount),
        status:    invoice.status,
        issueDate: invoice.issueDate.toISOString(),
        dueDate:   invoice.dueDate.toISOString(),
        notes:     invoice.notes,
        createdAt: invoice.createdAt.toISOString(),
        client:    invoice.client,
      },
    });
  } catch (error) {
    console.error("[CLIENT PORTAL INVOICE DETAIL ERROR]", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
