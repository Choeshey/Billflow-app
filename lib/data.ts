import type { User, Invoice, NavigationGroup, DashboardStat } from "./types";

// ─── Seed user (mock auth) ────────────────────────────────────────────────────

export const SEED_USER: User = {
  id:        "usr_01",
  name:      "Alex Rivera",
  email:     "alex@acme.com",
  role:      "ADMIN",
  createdAt: "2023-01-15T09:00:00Z",
};

// ─── Seed invoices ────────────────────────────────────────────────────────────

export const SEED_INVOICES: Invoice[] = [
  {
    id:        "inv_001",
    amount:    12_400,
    status:    "PAID",
    issueDate: "2025-05-01T10:00:00Z",
    dueDate:   "2025-05-15T10:00:00Z",
    notes:     "Annual subscription",
    createdAt: "2025-05-01T10:00:00Z",
    client: {
      id:   "cli_001",
      name: "Stripe Inc.",
    },
  },
  {
    id:        "inv_002",
    amount:    4_800,
    status:    "SENT",
    issueDate: "2025-05-10T08:30:00Z",
    dueDate:   "2025-05-24T08:30:00Z",
    notes:     null,
    createdAt: "2025-05-10T08:30:00Z",
    client: {
      id:   "cli_002",
      name: "Vercel Corp.",
    },
  },
  {
    id:        "inv_003",
    amount:    2_200,
    status:    "OVERDUE",
    issueDate: "2025-04-15T14:00:00Z",
    dueDate:   "2025-04-29T14:00:00Z",
    notes:     "Late fees applied",
    createdAt: "2025-04-15T14:00:00Z",
    client: {
      id:   "cli_003",
      name: "Linear Ltd.",
    },
  },
  {
    id:        "inv_004",
    amount:    7_600,
    status:    "PAID",
    issueDate: "2025-05-18T11:00:00Z",
    dueDate:   "2025-06-01T11:00:00Z",
    notes:     null,
    createdAt: "2025-05-18T11:00:00Z",
    client: {
      id:   "cli_004",
      name: "Figma LLC",
    },
  },
  {
    id:        "inv_005",
    amount:    1_950,
    status:    "SENT",
    issueDate: "2025-05-20T09:00:00Z",
    dueDate:   "2025-06-03T09:00:00Z",
    notes:     "Consulting services",
    createdAt: "2025-05-20T09:00:00Z",
    client: {
      id:   "cli_005",
      name: "Notion Inc.",
    },
  },
];

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export const DASHBOARD_STATS: DashboardStat[] = [
  {
    id:     "revenue",
    label:  "Total Revenue",
    value:  "$28,950",
    change: 14.2,
    trend:  "up",
  },
  {
    id:     "invoices",
    label:  "Active Invoices",
    value:  "23",
    change: 6.8,
    trend:  "up",
  },
  {
    id:     "overdue",
    label:  "Overdue Amount",
    value:  "$2,200",
    change: -3.1,
    trend:  "down",
  },
];

// ─── Navigation ───────────────────────────────────────────────────────────────

export const NAVIGATION: NavigationGroup[] = [
  {
    title: "Product",
    items: [
      { id: "dashboard", label: "Dashboard",  href: "/dashboard", icon: "⬡" },
      { id: "invoices",  label: "Invoices",   href: "/invoices",  icon: "◧", badge: 5 },
      { id: "analytics", label: "Analytics",  href: "/analytics", icon: "◈" },
    ],
  },
  {
    title: "Settings",
    items: [
      { id: "team",     label: "Team",     href: "/team",     icon: "◉" },
      { id: "billing",  label: "Billing",  href: "/billing",  icon: "◫" },
      { id: "settings", label: "Settings", href: "/settings", icon: "◌" },
    ],
  },
];
