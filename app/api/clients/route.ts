import { NextResponse, type NextRequest } from "next/server";
import { prisma }      from "@/lib/prisma";
import { getAuthUser } from "@/lib/server-utils";
import type { ApiResponse, Client } from "@/lib/types";

export async function GET(): Promise<NextResponse<ApiResponse<Client[]>>> {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

  const rows = await prisma.client.findMany({
    where:   { userId: auth.sub },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { invoices: true } } },
  });

  const clients: Client[] = rows.map((r) => ({
    id: r.id, name: r.name, email: r.email, company: r.company,
    createdAt: r.createdAt.toISOString(),
    _count: { invoices: r._count.invoices },
  }));

  return NextResponse.json({ success: true, data: clients });
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Client>>> {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ success: false, error: "Unauthorised." }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON." }, { status: 400 });
  }

  const { name, email, company } = body as Record<string, unknown>;
  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ success: false, error: "name is required." }, { status: 422 });
  }

  const row = await prisma.client.create({
    data: {
      name:    name.trim(),
      email:   typeof email   === "string" && email.trim()   ? email.trim()   : null,
      company: typeof company === "string" && company.trim() ? company.trim() : null,
      userId:  auth.sub,
    },
    include: { _count: { select: { invoices: true } } },
  });

  return NextResponse.json({
    success: true,
    data: {
      id: row.id, name: row.name, email: row.email, company: row.company,
      createdAt: row.createdAt.toISOString(),
      _count: { invoices: row._count.invoices },
    },
  }, { status: 201 });
}
