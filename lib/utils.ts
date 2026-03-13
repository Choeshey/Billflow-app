import type { InvoiceStatus } from "@/lib/types";


export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style:                 "currency",
    currency:              "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "short", day: "numeric",
  }).format(new Date(iso));
}

export function formatDateInput(iso: string): string {
  return new Date(iso).toISOString().split("T")[0] ?? "";
}


const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT:   "Draft",
  SENT:    "Sent",
  PAID:    "Paid",
  OVERDUE: "Overdue",
};

export function statusLabel(s: InvoiceStatus): string {
  return STATUS_LABELS[s];
}

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  DRAFT:   "bg-slate-100 text-slate-600",
  SENT:    "bg-blue-50 text-blue-700",
  PAID:    "bg-emerald-50 text-emerald-700",
  OVERDUE: "bg-red-50 text-red-600",
};

export function statusClasses(s: InvoiceStatus): string {
  return STATUS_CLASSES[s];
}
