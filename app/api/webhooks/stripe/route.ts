import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    const body      = await request.text();
    const signature = request.headers.get("stripe-signature") ?? "";

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET ?? ""
        );
    } catch (err) {
        console.error("[WEBHOOK] Invalid signature:", err);
        return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }

    try {
        switch (event.type) {

            // ── Admin upgrades to PRO ────────────────────────────────────────────
            case "checkout.session.completed": {
                const session = event.data.object as Stripe.Checkout.Session;
                const { userId, invoiceId, clientId, adminId } = session.metadata ?? {};

                // ── Client paying an invoice ───────────────────────────────────────
                if (invoiceId && clientId && adminId) {
                    await prisma.invoice.update({
                        where: { id: invoiceId },
                        data:  { status: "PAID" },
                    });
                    console.log(`[WEBHOOK] Invoice ${invoiceId} marked as PAID by client ${clientId}`);
                    break;
                }

                // ── Admin subscription upgrade ─────────────────────────────────────
                if (userId) {
                    await prisma.subscription.upsert({
                        where:  { userId },
                        update: {
                            plan:                "PRO",
                            active:              true,
                            stripeCustomerId:    typeof session.customer === "string" ? session.customer : session.customer?.id ?? "",
                            stripeSubscriptionId: typeof session.subscription === "string"
                                ? session.subscription
                                : session.subscription?.id ?? "",
                            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        },
                        create: {
                            userId,
                            plan:                "PRO",
                            active:              true,
                            stripeCustomerId:    typeof session.customer === "string" ? session.customer : session.customer?.id ?? "",
                            stripeSubscriptionId: typeof session.subscription === "string"
                                ? session.subscription
                                : session.subscription?.id ?? "",
                            renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        },
                    });
                    console.log(`[WEBHOOK] User ${userId} upgraded to PRO`);
                }
                break;
            }

            // ── Admin subscription cancelled → downgrade to FREE ────────────────
            case "customer.subscription.deleted": {
                const subscription = event.data.object as Stripe.Subscription;
                await prisma.subscription.updateMany({
                    where: { stripeSubscriptionId: subscription.id },
                    data:  { plan: "FREE", active: false },
                });
                console.log(`[WEBHOOK] Subscription ${subscription.id} cancelled → FREE`);
                break;
            }

            // ── Admin subscription renewed ───────────────────────────────────────
            case "invoice.payment_succeeded": {
                const inv            = event.data.object as Stripe.Invoice;
                const subscriptionId = typeof inv.subscription === "string"
                    ? inv.subscription
                    : null;
                if (!subscriptionId) break;

                await prisma.subscription.updateMany({
                    where: { stripeSubscriptionId: subscriptionId },
                    data:  {
                        active:      true,
                        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    },
                });
                break;
            }
        }
    } catch (error) {
        console.error("[WEBHOOK] Handler error:", error);
        return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
