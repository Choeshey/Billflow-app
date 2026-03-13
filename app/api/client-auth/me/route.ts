import { NextResponse } from "next/server";
import { getAuthClient } from "@/lib/client-server-utils";
import { prisma } from "@/lib/prisma";

// GET /api/client-auth/me
export async function GET() {
    try {
        const client = await getAuthClient();
        if (!client) {
            return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });
        }

        const dbClient = await prisma.client.findUnique({
            where:  { id: client.sub },
            select: { id: true, name: true, email: true, company: true },
        });

        if (!dbClient) {
            return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: dbClient });
    } catch (error) {
        console.error("[CLIENT ME ERROR]", error);
        return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
    }
}
