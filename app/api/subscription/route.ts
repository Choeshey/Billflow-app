import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-utils";
import { type NextRequest } from "next/server";



export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

    const sub = await prisma.subscription.findUnique({
      where: { userId: auth.sub },
    });

    if (!sub) {
      return NextResponse.json({
        success: true,
        data: { plan: "FREE", active: true, renewalDate: null, userId: auth.sub },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id:          sub.id,
        plan:        sub.plan,
        active:      sub.active,
        renewalDate: sub.renewalDate?.toISOString() ?? null,
        userId:      sub.userId,
      },
    });
  } catch (error) {
    console.error("[SUBSCRIPTION GET ERROR]", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

    let body: unknown;
    try { body = await request.json(); }
    catch { return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 }); }

    const { plan } = body as Record<string, unknown>;

    if (plan !== "FREE" && plan !== "PRO") {
      return NextResponse.json({ success: false, error: "Invalid plan." }, { status: 422 });
    }

    const sub = await prisma.subscription.upsert({
      where:  { userId: auth.sub },
      update: { plan: plan as "FREE" | "PRO" },
      create: { userId: auth.sub, plan: plan as "FREE" | "PRO", active: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        id:          sub.id,
        plan:        sub.plan,
        active:      sub.active,
        renewalDate: sub.renewalDate?.toISOString() ?? null,
        userId:      sub.userId,
      },
    });
  } catch (error) {
    console.error("[SUBSCRIPTION PATCH ERROR]", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
