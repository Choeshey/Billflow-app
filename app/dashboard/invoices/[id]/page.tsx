"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Invoice, InvoiceStatus, ApiResponse } from "@/lib/types";
import { useInvoices } from "@/hooks/useInvoices";
import { Card, Button, StatusBadge, Select, Spinner } from "@/components/ui";
import { formatCurrency, formatDate, formatDateInput } from "@/lib/utils";

export default function InvoiceDetailPage(): JSX.Element {
  const { id }  = useParams<{ id: string }>();
  const { update, remove } = useInvoices();
  const router  = useRouter();

  const [invoice,  setInvoice]  = useState<Invoice | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [status,   setStatus]   = useState<InvoiceStatus>("DRAFT");
  const [dueDate,  setDueDate]  = useState("");
  const [notes,    setNotes]    = useState("");
  const [showDel,  setShowDel]  = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (): Promise<void> => {
    const res  = await fetch(`/api/invoices/${id}`);
    const json = (await res.json()) as ApiResponse<Invoice>;
    if (json.success && json.data !== undefined) {
      setInvoice(json.data);
      setStatus(json.data.status);
      setDueDate(formatDateInput(json.data.dueDate));
      setNotes(json.data.notes ?? "");
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const handleSave = async (): Promise<void> => {
    setSaving(true);
    try {
      const updated = await update(id, { status, dueDate, notes: notes || undefined });
      setInvoice(updated);
    } finally { setSaving(false); }
  };

  const handleDelete = async (): Promise<void> => {
    setDeleting(true);
    try { await remove(id); router.push("/dashboard/invoices"); }
    finally { setDeleting(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (invoice === null) return <p className="text-center py-20 text-slate-500">Invoice not found.</p>;

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <nav className="text-xs text-slate-400 mb-1">
            <Link href="/dashboard/invoices" className="hover:text-slate-600">Invoices</Link>
            {" / "}<span className="text-slate-600">#{id.slice(-8).toUpperCase()}</span>
          </nav>
          <h2 className="text-xl font-semibold text-slate-800">Invoice Detail</h2>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={invoice.status} />
          <Button variant="danger" size="sm" onClick={() => setShowDel(true)}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Client info */}
        <Card>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Client</p>
          <p className="font-semibold text-slate-800 text-lg">{invoice.client?.name ?? "—"}</p>
          {invoice.client?.company !== null && invoice.client?.company !== undefined && (
            <p className="text-sm text-slate-500">{invoice.client.company}</p>
          )}
          <Link
            href={`/dashboard/clients/${invoice.clientId}`}
            className="inline-block mt-2 text-xs text-indigo-600 hover:underline"
          >
            View client →
          </Link>
        </Card>

        {/* Amount */}
        <Card>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Amount</p>
          <p className="text-3xl font-bold text-slate-800 tabular-nums">{formatCurrency(invoice.amount)}</p>
          <p className="text-xs text-slate-400 mt-1">Issued {formatDate(invoice.issueDate)}</p>
        </Card>
      </div>

      {/* Edit panel */}
      <Card>
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Update Invoice</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
          >
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </Select>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700" htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate" type="date" value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-9 px-3 rounded-lg bg-white border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="text-sm font-medium text-slate-700 block mb-1.5" htmlFor="notes">Notes</label>
          <textarea
            id="notes" rows={3} value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, special instructions…"
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
          />
        </div>

        <Button onClick={() => { void handleSave(); }} isLoading={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </Card>

      {/* Meta */}
      <p className="text-xs text-slate-400">
        Created {formatDate(invoice.createdAt)} · Last updated {formatDate(invoice.updatedAt)}
      </p>

      <ConfirmModal
        open={showDel} onClose={() => setShowDel(false)}
        onConfirm={() => { void handleDelete(); }}
        title="Delete invoice?" description="This cannot be undone." loading={deleting}
      />
    </div>
  );
}
