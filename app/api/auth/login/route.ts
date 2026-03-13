import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken, verifyToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";
import type { ApiResponse, User } from "@/lib/types";

// GET /api/auth/login — return current user from cookie
export async function GET(
    request: NextRequest
): Promise<NextResponse<ApiResponse<User>>> {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ success: false, error: "Not authenticated." });
  }

  try {
    const payload = await verifyToken(token);
    const dbUser = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!dbUser) {
      return NextResponse.json({ success: false, error: "User not found." });
    }

    const user: User = {
      id:        dbUser.id,
      name:      dbUser.name,
      email:     dbUser.email,
      role:      dbUser.role,
      avatarUrl: dbUser.avatarUrl ?? null, // 👈 add this
      createdAt: dbUser.createdAt.toISOString(),
    };


    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, error: "Invalid token." });
  }
}

// POST /api/auth/login — authenticate and set cookie
export async function POST(
    request: NextRequest
): Promise<NextResponse<ApiResponse<User>>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
        { success: false, error: "Invalid JSON." },
        { status: 400 }
    );
  }

  const { email, password } = body as Record<string, unknown>;

  if (typeof email !== "string" || typeof password !== "string") {
    return NextResponse.json(
        { success: false, error: "email and password required." },
        { status: 422 }
    );
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!dbUser) {
      return NextResponse.json(
          { success: false, error: "Invalid email or password." },
          { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, dbUser.password);
    if (!valid) {
      return NextResponse.json(
          { success: false, error: "Invalid email or password." },
          { status: 401 }
      );
    }

    const token = await signToken({
      sub:   dbUser.id,
      name:  dbUser.name,
      email: dbUser.email,
      role:  dbUser.role,
    });

    const user: User = {
      id:        dbUser.id,
      name:      dbUser.name,
      email:     dbUser.email,
      role:      dbUser.role,
      createdAt: dbUser.createdAt.toISOString(),
    };

    const response = NextResponse.json({ success: true, data: user });
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error("[LOGIN POST ERROR]", error);
    return NextResponse.json(
        { success: false, error: "Internal server error." },
        { status: 500 }
    );
  }
}
