import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signClientToken, CLIENT_COOKIE_NAME, CLIENT_COOKIE_OPTIONS } from "@/lib/client-auth";

export async function POST(request: NextRequest) {
    let body: unknown;
    try { body = await request.json(); }
    catch { return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 }); }

    const { email, password } = body as Record<string, unknown>;

    if (typeof email !== "string" || typeof password !== "string") {
        return NextResponse.json({ success: false, error: "Email and password required." }, { status: 422 });
    }

    try {
        // Find client by email
        const client = await prisma.client.findFirst({
            where: { email: email.toLowerCase().trim() },
        });

        if (!client) {
            return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
        }

        if (!client.password) {
            return NextResponse.json({
                success: false,
                error: "No password set. Contact your account manager.",
            }, { status: 401 });
        }

        const valid = await bcrypt.compare(password, client.password);
        if (!valid) {
            return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
        }

        const token = await signClientToken({
            sub:     client.id,
            name:    client.name,
            email:   client.email ?? "",
            adminId: client.userId,
        });

        const response = NextResponse.json({
            success: true,
            data: { id: client.id, name: client.name, email: client.email },
        });
        response.cookies.set(CLIENT_COOKIE_NAME, token, CLIENT_COOKIE_OPTIONS);
        return response;
    } catch (error) {
        console.error("[CLIENT LOGIN ERROR]", error);
        return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
    }
}
