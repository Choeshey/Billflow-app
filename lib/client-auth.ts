import { jwtVerify, SignJWT } from "jose";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const CLIENT_COOKIE_NAME = "client-auth-token";

export const CLIENT_COOKIE_OPTIONS: Partial<ResponseCookie> = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    path:     "/",
    maxAge:   60 * 60 * 24, // 1 day
};

const SECRET_KEY = new TextEncoder().encode(
    (process.env.JWT_SECRET ?? "your-secret-key") + "-client"
);

export interface ClientTokenPayload {
    sub:      string;  // client id
    name:     string;
    email:    string;
    adminId:  string;  // which admin owns this client
}

export async function signClientToken(payload: ClientTokenPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(SECRET_KEY);
}

export async function verifyClientToken(token: string): Promise<ClientTokenPayload> {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as ClientTokenPayload;
}