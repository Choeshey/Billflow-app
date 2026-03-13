import { NextResponse } from "next/server";
import { CLIENT_COOKIE_NAME } from "@/lib/client-auth";

export async function POST() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete(CLIENT_COOKIE_NAME);
    return response;
}
