import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getAuthUser } from "@/lib/server-utils";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2025-01-27.acacia",
});

// POST /api/subscription/checkout — create Stripe Checkout session
export async function POST() {
    try {
        const auth = await getAuthUser();
        if (!auth) {
            return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });
        }

        // Get or create Stripe customer
        const user = await prisma.user.findUnique({ where: { id: auth.sub } });
        if (!user) {
            return NextResponse.json({ success: false, error: "User not found." }, { status: 404 });
        }

        // Check if already on PRO
        const sub = await prisma.subscription.findUnique({ where: { userId: auth.sub } });
        if (sub?.plan === "PRO" && sub?.active) {
            return NextResponse.json({ success: false, error: "Already on PRO plan." }, { status: 400 });
        }

        const session = await stripe.checkout.sessions.create({
            mode:                "subscription",
            payment_method_types: ["card"],
            customer_email:       user.email,
            line_items: [
                {
                    price:    process.env.STRIPE_PRO_PRICE_ID,
                    quantity: 1,
                },
            ],
            metadata: {
                userId: auth.sub,
            },
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?success=true`,
            cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?canceled=true`,
        });

        return NextResponse.json({ success: true, data: { url: session.url } });
    } catch (error) {
        console.error("[CHECKOUT ERROR]", error);
        return NextResponse.json({ success: false, error: "Failed to create checkout session." }, { status: 500 });
    }
}
