import { NextResponse, type NextRequest } from "next/server";
import type { ApiResponse, User } from "@/lib/types";
import { registerUser } from "@/services/authService";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<User>>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 });
  }

  const { name, email, password } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ success: false, error: "Name must be at least 2 characters." }, { status: 422 });
  }
  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ success: false, error: "Valid email is required." }, { status: 422 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ success: false, error: "Password must be at least 8 characters." }, { status: 422 });
  }

  try {
    const result = await registerUser({ name, email, password });
    if (!result.success) {
      return NextResponse.json(result, { status: 409 }); // 409 Conflict = email already exists
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[REGISTER ERROR]", error);
    return NextResponse.json({ success: false, error: "Internal server error." }, { status: 500 });
  }
}
