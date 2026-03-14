"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Client, InvoiceStatus, ApiResponse } from "@/lib/types";
import { useInvoices } from "@/hooks/useInvoices";
import { Card, Input, Select, Button, Textarea } from "@/components/ui";

interface Fields { clientId: string; amount: string; status: InvoiceStatus; dueDate: string; notes: string; }

export default function NewInvoicePage() {
  const { create }     = useInvoices();
  const router         = useRouter();
  const searchParams   = useSearchParams();
  const preClientId    = searchParams.get("clientId") ?? "";

  const [clients, setClients] = useState<Client[]>([]);
  const [fields,  setFields]  = useState<Fields>({
    clientId: preClientId, amount: "", status: "DRAFT",
    dueDate: new Date(Date.now() + 30 * 86_400_000).toISOString().split("T")[0] ?? "",
    notes: "",
  });
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json() as Promise<ApiResponse<Client[]>>)
      .then((j) => { if (j.success && j.data !== undefined) setClients(j.data); });
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (fields.clientId === "")     { setError("Please select a client."); return; }
    if (Number(fields.amount) <= 0) { setError("Amount must be greater than 0."); return; }
    setError(null); setLoading(true);
    try {
      const inv = await create({
        clientId: fields.clientId,
        amount:   fields.amount,
        status:   fields.status,
        dueDate:  fields.dueDate,
        notes:    fields.notes || "",
      });
      router.push(`/dashboard/invoices/${inv.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <nav className="text-xs text-slate-400 mb-1">
          <Link href="/dashboard/invoices" className="hover:text-slate-600">Invoices</Link>
          {" / "}<span className="text-slate-600">New</span>
        </nav>
        <h2 className="text-xl font-semibold text-slate-800">Create Invoice</h2>
      </div>

      <Card>
        <form onSubmit={(e) => { void handleSubmit(e); }} noValidate className="space-y-5">
          <Select
            label="Client *"
            value={fields.clientId}
            onChange={(e) => setFields((p) => ({ ...p, clientId: e.target.value }))}
          >
            <option value="">— Select a client —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}{c.company !== null ? ` (${c.company})` : ""}</option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount (USD) *" type="number" min="0.01" step="0.01"
              placeholder="0.00" value={fields.amount}
              onChange={(e) => setFields((p) => ({ ...p, amount: e.target.value }))}
            />
            <Input
              label="Due Date *" type="date" value={fields.dueDate}
              onChange={(e) => setFields((p) => ({ ...p, dueDate: e.target.value }))}
            />
          </div>

          <Select
            label="Status"
            value={fields.status}
            onChange={(e) => setFields((p) => ({ ...p, status: e.target.value as InvoiceStatus }))}
          >
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
          </Select>

          <Textarea
            label="Notes (optional)" placeholder="Payment terms, special instructions…"
            value={fields.notes}
            onChange={(e) => setFields((p) => ({ ...p, notes: e.target.value }))}
          />

          {error !== null && <p role="alert" className="text-xs text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="submit" isLoading={loading}>{loading ? "Creating…" : "Create Invoice"}</Button>
            <Link href="/dashboard/invoices"><Button variant="secondary" type="button">Cancel</Button></Link>
          </div>
        </form>
      </Card>

      {clients.length === 0 && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          No clients found. <Link href="/dashboard/clients/new" className="underline font-medium">Add a client</Link> first.
        </p>
      )}
    </div>
  );
}
