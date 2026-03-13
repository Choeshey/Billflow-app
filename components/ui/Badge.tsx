import type { InvoiceStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: InvoiceStatus | string;
}

const CONFIG: Record<string, { label: string; className: string }> = {
  PAID:    { label: "Paid",    className: "bg-emerald-100 text-emerald-700" },
  SENT:    { label: "Sent",    className: "bg-blue-100 text-blue-700"       },
  DRAFT:   { label: "Draft",   className: "bg-slate-100 text-slate-600"     },
  OVERDUE: { label: "Overdue", className: "bg-red-100 text-red-700"         },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = CONFIG[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
