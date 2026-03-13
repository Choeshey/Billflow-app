import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getAuthClient } from "@/lib/client-server-utils";

// POST /api/client-portal/invoices/[id]/pay
export async function POST(
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
                status:   { in: ["SENT", "OVERDUE"] }, // only unpaid invoices
            },
            include: { client: true },
        });

        if (!invoice) {
            return NextResponse.json({ success: false, error: "Invoice not found or already paid." }, { status: 404 });
        }

        const session = await stripe.checkout.sessions.create({
            mode:                 "payment",
            payment_method_types: ["card"],
            customer_email:       client.email,
            line_items: [
                {
                    quantity:   1,
                    price_data: {
                        currency:     "usd",
                        unit_amount:  Math.round(Number(invoice.amount) * 100), // convert to cents
                        product_data: {
                            name:        `Invoice #${invoice.id.slice(0, 8).toUpperCase()}`,
                            description: `Payment for services — Due ${new Date(invoice.dueDate).toLocaleDateString()}`,
                        },
                    },
                },
            ],
            metadata: {
                invoiceId: invoice.id,
                clientId:  client.sub,
                adminId:   client.adminId,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/client/portal/${invoice.id}?paid=true`,
            cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/client/portal/${invoice.id}?canceled=true`,
        });

        return NextResponse.json({ success: true, data: { url: session.url } });
    } catch (error) {
        console.error("[CLIENT INVOICE PAY ERROR]", error);
        return NextResponse.json({ success: false, error: "Failed to create payment session." }, { status: 500 });
    }
}
