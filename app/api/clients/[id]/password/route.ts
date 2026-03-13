import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

    const { id } = await params;

    let body: unknown;
    try { body = await request.json(); }
    catch { return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 }); }

    const { password } = body as Record<string, unknown>;

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters." },
        { status: 422 }
      );
    }

    const client = await prisma.client.findFirst({
      where: { id, userId: auth.sub },
    });

    if (!client) {
      return NextResponse.json({ success: false, error: "Client not found." }, { status: 404 });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.client.update({
      where: { id: client.id },
      data:  { password: hashed },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[CLIENT PASSWORD ERROR]", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
