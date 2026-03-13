// ─── Enums (mirror Prisma enums) ──────────────────────────────────────────────

export type UserRole         = "ADMIN" | "MEMBER";
export type InvoiceStatus    = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "PENDING";
export type SubscriptionPlan = "FREE"  | "PRO";

// ─── Domain models ────────────────────────────────────────────────────────────

export interface User {
  id:        string;
  name:      string;
  email:     string;
  role:      string;
  createdAt: string;
}

export interface Client {
  id:        string;
  name:      string;
  email:     string | null;
  company:   string | null;
  createdAt: string;
  _count?: { invoices: number };
}

export interface Invoice {
  id:        string;
  amount:    number;
  status:    InvoiceStatus;
  issueDate: string;
  dueDate:   string;
  notes:     string | null;
  createdAt: string;
  client: {
    id:   string;
    name: string;
  };
}

export interface Subscription {
  id?:          string;   // 👈 make optional
  plan:         "FREE" | "PRO";
  active:       boolean;
  renewalDate:  string | null;
  userId:       string;
}

// ─── API contract ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?:   T;
  error?:  string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalRevenue:    number;
  activeInvoices:  number;
  overdueAmount:   number;
  totalClients:    number;
  recentInvoices:  Invoice[];
}

export interface DashboardStat {
  id:     string;
  label:  string;
  value:  string;
  change: number;
  trend:  "up" | "down" | "neutral";
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavigationItem {
  id:     string;
  label:  string;
  href:   string;
  icon:   string;
  badge?: number;
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

// ─── Fetch state (discriminated union) ───────────────────────────────────────

export type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error";   error: string };

// ─── Forms ────────────────────────────────────────────────────────────────────

export interface LoginForm {
  email:    string;
  password: string;
}

export interface CreateClientForm {
  name:    string;
  email:   string;
  company: string;
}

export interface CreateInvoiceForm {
  clientId: string;
  amount:   string;
  status:   InvoiceStatus;
  dueDate:  string;
  notes:    string;
}
// Add these to lib/types.ts if they don't exist

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface RegisterPayload {
  name:     string;
  email:    string;
  password: string;
}

export interface UpdateUserPayload {
  name?:        string;
  email?:       string;
  newPassword?: string;
}
