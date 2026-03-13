import { cookies } from "next/headers";
import { verifyClientToken, CLIENT_COOKIE_NAME, type ClientTokenPayload } from "@/lib/client-auth";

/**
 * Server-only — use inside client portal route handlers.
 * Returns the decoded client JWT payload or null if unauthenticated.
 */
export async function getAuthClient(): Promise<ClientTokenPayload | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(CLIENT_COOKIE_NAME)?.value;
        if (!token) return null;
        return await verifyClientToken(token);
    } catch {
        return null;
    }
}