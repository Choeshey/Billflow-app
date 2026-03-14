"use client";

import { type FormEvent, useState } from "react";
import { useClients }    from "@/hooks/useClients";
import { Card }          from "@/components/ui/Card";
import { Button }        from "@/components/ui/Button";
import { Input }         from "@/components/ui/Input";
import { Modal }         from "@/components/ui/Modal";
import { Spinner }       from "@/components/ui/Spinner";
import { EmptyState }    from "@/components/ui/EmptyState";
import { formatDate }    from "@/lib/utils";
import Link from "next/link"; // 👈 add this
import type { CreateClientForm } from "@/lib/types";

const EMPTY_FORM: CreateClientForm = { name: "", email: "", company: "" };

// @ts-ignore
export default function ClientsPage() {
  const { state, create, remove } = useClients();
  const [modal,      setModal]    = useState(false);
  const [form,       setForm]     = useState<CreateClientForm>(EMPTY_FORM);
  const [formError,  setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting,   setDeleting]  = useState<string | null>(null);

  const handleCreate = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!form.name.trim()) { setFormError("Client name is required."); return; }
    setFormError(null);
    setSubmitting(true);
    try {
      await create(form);
      setForm(EMPTY_FORM);
      setModal(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed.");
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Delete this client and all their invoices?")) return;
    setDeleting(id);
    try { await remove(id); }
    finally { setDeleting(null); }
  };

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Clients</h2>
          <p className="text-sm text-slate-500 mt-0.5">Manage your client directory</p>
        </div>
        <Button onClick={() => setModal(true)}>+ Add Client</Button>
      </div>

      {/* State */}
      {state.status === "loading" && (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      )}
      {state.status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600">{state.error}</div>
      )}
      {state.status === "success" && state.data.length === 0 && (
        <Card>
          <EmptyState icon="👥" title="No clients yet"
            detail="Add your first client to start sending invoices."
            action={<Button onClick={() => setModal(true)}>Add Client</Button>} />
        </Card>
      )}

      {/* Table */}
      {state.status === "success" && state.data.length > 0 && (
        <Card noPad>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  {["Name", "Company", "Email", "Invoices", "Added", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.data.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">
                      <Link href={`/dashboard/clients/${client.id}`}
                          className="hover:text-violet-600 transition-colors">
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{client.company ?? "—"}</td>
                    <td className="px-5 py-3.5 text-slate-500">{client.email ?? "—"}</td>
                    <td className="px-5 py-3.5 text-slate-500">{client._count?.invoices ?? 0}</td>
                    <td className="px-5 py-3.5 text-slate-400">{formatDate(client.createdAt)}</td>
                    <td className="px-5 py-3.5">
                      <Button
                        variant="danger" size="sm"
                        isLoading={deleting === client.id}
                        onClick={() => { void handleDelete(client.id); }}
                      >
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

      {/* Modal */}
      <Modal open={modal} onClose={() => { setModal(false); setForm(EMPTY_FORM); setFormError(null); }} title="Add Client">
        <form onSubmit={(e) => { void handleCreate(e); }} noValidate className="space-y-4">
          <Input label="Name *" placeholder="Jane Doe"
            value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <Input label="Company" placeholder="Acme Corp."
            value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} />
          <Input label="Email" type="email" placeholder="jane@acme.com"
            value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
          {formError && <p className="text-xs text-red-500">{formError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" isLoading={submitting}>Create Client</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
