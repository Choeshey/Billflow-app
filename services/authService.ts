import bcrypt from "bcryptjs";
import type { ApiResponse, User, LoginPayload, RegisterPayload, UpdateUserPayload } from "@/lib/types";
import { prisma } from "@/lib/prisma";

function toUser(u: { id: string; name: string; email: string; role: string; createdAt: Date }): User {
  return { id: u.id, name: u.name, email: u.email, role: u.role as User["role"], createdAt: u.createdAt.toISOString() };
}

export async function registerUser(payload: RegisterPayload): Promise<ApiResponse<User>> {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing !== null) return { success: false, error: "Email already in use." };
  const hashed = await bcrypt.hash(payload.password, 12);
  const user = await prisma.user.create({
    data: { name: payload.name.trim(), email: payload.email.toLowerCase().trim(), password: hashed, subscription: { create: { plan: "FREE", active: true } } },
  });
  return { success: true, data: toUser(user) };
}

export async function loginUser(payload: LoginPayload): Promise<ApiResponse<User>> {
  const user = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });
  if (user === null) return { success: false, error: "Invalid email or password." };
  const valid = await bcrypt.compare(payload.password, user.password);
  if (!valid) return { success: false, error: "Invalid email or password." };
  return { success: true, data: toUser(user) };
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (user === null) return null;
  return toUser(user);
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<ApiResponse<User>> {
  const updates: Record<string, unknown> = {};
  if (payload.name !== undefined) updates["name"] = payload.name.trim();
  if (payload.email !== undefined) updates["email"] = payload.email.toLowerCase().trim();
  if (payload.newPassword !== undefined) updates["password"] = await bcrypt.hash(payload.newPassword, 12);
  const user = await prisma.user.update({ where: { id }, data: updates });
  return { success: true, data: toUser(user) };
}
