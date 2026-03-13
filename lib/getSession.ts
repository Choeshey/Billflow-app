import { cookies } from "next/headers";
import { verifyToken, COOKIE_NAME, type JwtPayload } from "@/lib/auth";

export async function getSession(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token       = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try { return await verifyToken(token); } catch { return null; }
}
