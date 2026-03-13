import { NextResponse, type NextRequest } from "next/server";
import type { ApiResponse, User, UpdateUserPayload } from "@/lib/types";
import { getAuthUser } from "@/lib/server-utils";
import { getUserById, updateUser } from "@/services/authService";

export async function GET(): Promise<NextResponse<ApiResponse<User>>> {
  const auth = await getAuthUser();
  if (auth === null) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });
  const user = await getUserById(auth.sub);
  if (user === null) return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });
  return NextResponse.json({ success: true, data: user });
}

export async function PATCH(req: NextRequest): Promise<NextResponse<ApiResponse<User>>> {
  const auth = await getAuthUser();
  if (auth === null) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 }); }
  const result = await updateUser(auth.sub, body as UpdateUserPayload);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
