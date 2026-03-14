"use client";

import { type FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { Client, Invoice, ApiResponse } from "@/lib/types";
import { useClients } from "@/hooks/useClients";
import { Card, Input, Button, StatusBadge, Spinner } from "@/components/ui";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SetClientPassword } from "@/components/dashboard/SetClientPassword";

// @ts-ignore
export default function ClientDetailPage() {
  const { id }  = useParams<{ id: string }>();
  const { update } = useClients();
  const router = useRouter();

  const [client,   setClient]   = useState<Client | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [fields,   setFields]   = useState({ name: "", email: "", company: "" });

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const [cr, ir] = await Promise.all([
        fetch(`/api/clients/${id}`).then((r) => r.json() as Promise<ApiResponse<Client>>),
        fetch("/api/invoices").then((r) => r.json() as Promise<ApiResponse<Invoice[]>>),
      ]);
      if (cr.success && cr.data !== undefined) {
        setClient(cr.data);
        setFields({ name: cr.data.name, email: cr.data.email ?? "", company: cr.data.company ?? "" });
      }
      if (ir.success && ir.data !== undefined)
          // ✅ Fixed
        setInvoices(ir.data.filter((i) => i.client?.id === id));
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null); setSaving(true);
    try {
      await update(id, { name: fields.name, email: fields.email || undefined, company: fields.company || undefined });
      router.push("/dashboard/clients");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally { setSaving(false); }
  };

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>): void =>
    setFields((p) => ({ ...p, [k]: e.target.value }));

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (client === null) return <p className="text-center py-20 text-slate-500">Client not found.</p>;

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <nav className="text-xs text-slate-400 mb-1">
          <Link href="/dashboard/clients" className="hover:text-slate-600">Clients</Link>
          {" / "}<span className="text-slate-600">{client.name}</span>
        </nav>
        <h2 className="text-xl font-semibold text-slate-800">Edit Client</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edit form */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Client Details</h3>
          <form onSubmit={(e) => { void handleSubmit(e); }} noValidate className="space-y-4">
            <Input label="Name *"    value={fields.name}    onChange={set("name")}    required />
            <Input label="Email"     type="email" value={fields.email}    onChange={set("email")}    />
            <Input label="Company"   value={fields.company} onChange={set("company")} />
            {error !== null && <p role="alert" className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2 pt-1">
              <Button type="submit" isLoading={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
              <Link href="/dashboard/clients"><Button variant="secondary" type="button">Cancel</Button></Link>
            </div>
          </form>
        </Card>

        {/* Stats */}
        <div className="space-y-4">
          <Card>
            <p className="text-xs text-slate-500 mb-1">Total Invoices</p>
            <p className="text-3xl font-bold text-slate-800">{invoices.length}</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 mb-1">Total Billed</p>
            <p className="text-3xl font-bold text-slate-800">
              {formatCurrency(invoices.reduce((s, i) => s + Number(i.amount), 0))}
            </p>
          </Card>

          <SetClientPassword clientId={id} clientName={client.name} /> {/* 👈 moved here */}

          </div>
      </div>

      {/* Invoices */}
      <Card className="p-0">
        <Card.Header>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Invoices for {client.name}</h3>
            <Link href={`/dashboard/invoices/new?clientId=${id}`}>
              <Button variant="secondary" size="sm">+ New Invoice</Button>
            </Link>
          </div>
        </Card.Header>
        {invoices.length === 0
          ? <p className="text-sm text-slate-400 text-center py-10">No invoices yet.</p>
          : <div className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <Link
                  key={inv.id} href={`/dashboard/invoices/${inv.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">{formatDate(inv.createdAt)}</p>
                  </div>
                  <StatusBadge status={inv.status} />
                  <p className="text-sm font-semibold text-slate-800 tabular-nums">{formatCurrency(inv.amount)}</p>
                </Link>
              ))}
            </div>
        }
      </Card>
    </div>
  );
}

import type React from "react";
