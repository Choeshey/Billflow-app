import type { SubscriptionPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const PLAN_LIMITS: Record<SubscriptionPlan, { invoices: number | null }> = {
  FREE: { invoices: 5 },
  PRO:  { invoices: null },
};

export const PLAN_PRICES = {
  PRO: {
    monthly: process.env.STRIPE_PRO_PRICE_ID ?? "",
    label:   "$12/month",
    amount:  12,
  },
};

export async function canCreateInvoice(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
}> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const plan: SubscriptionPlan = sub?.plan ?? "FREE";
  const limit = PLAN_LIMITS[plan].invoices;
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

export async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  return sub?.plan ?? "FREE";
}
