import { jwtVerify, SignJWT } from "jose";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const COOKIE_NAME = "auth-token";

export const COOKIE_OPTIONS: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET ?? "your-secret-key-change-in-production"
);

export interface TokenPayload {
  sub: string;   // user id
  name: string;
  email: string;
  role?: string;
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * Throws if the token is invalid or expired.
 */
export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, SECRET_KEY);
  return payload as unknown as TokenPayload;
}

/**
 * Signs a new JWT token with the given payload.
 * Expires in 7 days by default.
 */
export async function signToken(
    payload: TokenPayload,
    expiresIn = "7d"
): Promise<string> {
  return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(SECRET_KEY);
}