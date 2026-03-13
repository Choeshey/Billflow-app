import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME, type TokenPayload } from "@/lib/auth";

/**
 * Server-only helper — use inside route handlers and Server Components only.
 * Returns the decoded JWT payload or null if unauthenticated.
 */
export async function getAuthUser(): Promise<TokenPayload | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(COOKIE_NAME)?.value;
        if (!token) return null;
        return await verifyToken(token);
    } catch {
        return null;
    }
}