"use client";

import { type FormEvent, useState } from "react";
import { useInvoices } from "@/hooks/useInvoices";
import { useClients }  from "@/hooks/useClients";
import { Card }        from "@/components/ui/Card";
import { Button }      from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Modal }       from "@/components/ui/Modal";
import { Spinner }     from "@/components/ui/Spinner";
import { EmptyState }  from "@/components/ui/EmptyState";
import { formatCurrency, formatDate, statusLabel, statusClasses, cn } from "@/lib/utils";
import type { CreateInvoiceForm, InvoiceStatus } from "@/lib/types";

const STATUSES: InvoiceStatus[] = ["DRAFT", "SENT", "PAID", "OVERDUE"];

const EMPTY: CreateInvoiceForm = {
  clientId: "", amount: "", status: "DRAFT",
  dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0] ?? "",
  notes: "",
};

// @ts-ignore
export default function InvoicesPage(): JSX.Element {
  const { state, create, updateStatus, remove } = useInvoices();
  const { state: clientState }                  = useClients();
  const [modal,      setModal]     = useState(false);
  const [form,       setForm]      = useState<CreateInvoiceForm>(EMPTY);
  const [formError,  setFormError] = useState<string | null>(null);
  const [submitting, setSubmit]    = useState(false);
  const [deleting,   setDeleting]  = useState<string | null>(null);

  const clients = clientState.status === "success" ? clientState.data : [];

  const handleCreate = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!form.clientId) { setFormError("Please select a client."); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setFormError("Enter a valid amount."); return; }
    setFormError(null);
    setSubmit(true);
    try {
      await create(form);
      setForm(EMPTY);
      setModal(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed.");
    } finally { setSubmit(false); }
  };

  const handleStatusChange = async (id: string, s: InvoiceStatus): Promise<void> => {
    await updateStatus(id, s);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Delete this invoice?")) return;
    setDeleting(id);
    try { await remove(id); }
    finally { setDeleting(null); }
  };

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Invoices</h2>
          <p className="text-sm text-slate-500 mt-0.5">Track and manage all your invoices</p>
        </div>
        <Button onClick={() => setModal(true)}>+ New Invoice</Button>
      </div>

      {state.status === "loading" && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}
      {state.status === "error"   && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600">{state.error}</div>
      )}

      {state.status === "success" && state.data.length === 0 && (
        <Card>
          <EmptyState icon="🧾" title="No invoices yet" detail="Create your first invoice to get started."
            action={<Button onClick={() => setModal(true)}>New Invoice</Button>} />
        </Card>
      )}

      {state.status === "success" && state.data.length > 0 && (
        <Card noPad>
          {/* Summary bar */}
          <div className="px-5 py-3 border-b border-slate-100 grid grid-cols-4 gap-4">
            {STATUSES.map((s) => {
              const count = state.data.filter((i) => i.status === s).length;
              return (
                <div key={s} className="text-center">
                  <p className="text-xs text-slate-400">{statusLabel(s)}</p>
                  <p className="text-lg font-bold text-slate-800">{count}</p>
                </div>
              );
            })}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Client", "Amount", "Status", "Due Date", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.data.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{inv.client.name}</td>
                    <td className="px-5 py-3.5 text-slate-600 tabular-nums font-medium">{formatCurrency(inv.amount)}</td>
                    <td className="px-5 py-3.5">
                      <select
                        value={inv.status}
                        onChange={(e) => { void handleStatusChange(inv.id, e.target.value as InvoiceStatus); }}
                        className={cn(
                          "text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer outline-none",
                          statusClasses(inv.status)
                        )}
                        aria-label={`Status for invoice ${inv.id}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{statusLabel(s)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 tabular-nums">{formatDate(inv.dueDate)}</td>
                    <td className="px-5 py-3.5">
                      <Button variant="danger" size="sm"
                        isLoading={deleting === inv.id}
                        onClick={() => { void handleDelete(inv.id); }}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create modal */}
      <Modal open={modal} onClose={() => { setModal(false); setForm(EMPTY); setFormError(null); }} title="New Invoice" size="lg">
        <form onSubmit={(e) => { void handleCreate(e); }} noValidate className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Client *" value={form.clientId}
              onChange={(e) => setForm((p) => ({ ...p, clientId: e.target.value }))}>
              <option value="">Select a client…</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input label="Amount (USD) *" type="number" min="0.01" step="0.01" placeholder="0.00"
              value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
            <Select label="Status" value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as InvoiceStatus }))}>
              {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </Select>
            <Input label="Due Date *" type="date" value={form.dueDate}
              onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
          </div>
          <Textarea label="Notes" placeholder="Optional notes…"
            value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
          {clients.length === 0 && (
            <p className="text-xs text-amber-600">⚠ No clients found. Add a client before creating an invoice.</p>
          )}
          {formError && <p className="text-xs text-red-500">{formError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={submitting} disabled={clients.length === 0}>Create Invoice</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
