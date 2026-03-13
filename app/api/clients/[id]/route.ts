import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-utils";
import type { ApiResponse, Client } from "@/lib/types";

interface Params { params: Promise<{ id: string }> }

// GET /api/clients/[id]
export async function GET(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<Client>>> {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: { id, userId: auth.sub },
  });

  if (!client) return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });

  return NextResponse.json({
    success: true,
    data: {
      id:        client.id,
      name:      client.name,
      email:     client.email ?? null,
      company:   client.company ?? null,
      userId:    client.userId,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    },
  });
}

// PATCH /api/clients/[id]
export async function PATCH(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<Client>>> {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 }); }

  const { name, email, company } = body as Record<string, unknown>;

  const client = await prisma.client.update({
    where: { id },
    data: {
      ...(typeof name    === "string" && { name }),
      ...(typeof email   === "string" && { email }),
      ...(typeof company === "string" && { company }),
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      id:        client.id,
      name:      client.name,
      email:     client.email ?? null,
      company:   client.company ?? null,
      userId:    client.userId,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    },
  });
}

// DELETE /api/clients/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: Params
): Promise<NextResponse<ApiResponse<null>>> {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

  const { id } = await params;
  const client = await prisma.client.findFirst({ where: { id, userId: auth.sub } });
  if (!client) return NextResponse.json({ success: false, error: "Not found." }, { status: 404 });

  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ success: true, data: null });
}
