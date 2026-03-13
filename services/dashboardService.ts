import type { ApiResponse, DashboardStats } from "@/lib/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const res  = await fetch("/api/dashboard", { cache: "no-store" });
  const json = (await res.json()) as ApiResponse<DashboardStats>;
  if (!json.success || !json.data) throw new Error(json.error ?? "Failed.");
  return json.data;
}
