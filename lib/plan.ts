import type { SubscriptionPlan } from "@prisma/client";

// ── Plan Limits ────────────────────────────────────────────────────────────
export const PLAN_LIMITS: Record<SubscriptionPlan, { invoices: number | null }> = {
    FREE: { invoices: 5 },   // max 5 invoices
    PRO:  { invoices: null }, // null = unlimited
};

export const PLAN_PRICES = {
    PRO: {
        monthly:  process.env.STRIPE_PRO_PRICE_ID ?? "",
        label:    "$12/month",
        amount:   12,
    },
};

// ── Check if user can create more invoices ─────────────────────────────────
import { prisma } from "@/lib/prisma";

export async function canCreateInvoice(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
    limit?: number;
    current?: number;
}> {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    const plan: SubscriptionPlan = sub?.plan ?? "FREE";
    const limit = PLAN_LIMITS[plan].invoices;

    // PRO = unlimited
    if (limit === null) return { allowed: true };

    const current = await prisma.invoice.count({ where: { userId } });

    if (current >= limit) {
        return {
            allowed: false,
            reason:  `You've reached the FREE plan limit of ${limit} invoices. Upgrade to PRO for unlimited invoices.`,
            limit,
            current,
        };
    }

    return { allowed: true, limit, current };
}

// ── Get user's current plan ────────────────────────────────────────────────
export async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
    const sub = await prisma.subscription.findUnique({ where: { userId } });
    return sub?.plan ?? "FREE";
}