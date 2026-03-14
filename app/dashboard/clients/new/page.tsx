"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useClients } from "@/hooks/useClients";
import { Card, Input, Button } from "@/components/ui";

interface Fields { name: string; email: string; company: string; }

// @ts-ignore
export default function NewClientPage() {
  const { create } = useClients();
  const router = useRouter();
  const [fields,  setFields]  = useState<Fields>({ name: "", email: "", company: "" });
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (fields.name.trim() === "") { setError("Client name is required."); return; }
    setError(null); setLoading(true);
    try {

// ✅ Fixed — pass empty string instead of undefined
      await create({
        name:    fields.name,
        email:   fields.email,
        company: fields.company,
      });
      router.push("/dashboard/clients");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create client.");
    } finally { setLoading(false); }
  };

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>): void =>
    setFields((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <nav className="text-xs text-slate-400 mb-1">
          <Link href="/dashboard/clients" className="hover:text-slate-600">Clients</Link>
          {" / "}<span className="text-slate-600">New</span>
        </nav>
        <h2 className="text-xl font-semibold text-slate-800">Add Client</h2>
      </div>

      <Card>
        <form onSubmit={(e) => { void handleSubmit(e); }} noValidate className="space-y-5">
          <Input label="Client name *" placeholder="Acme Corporation" value={fields.name} onChange={set("name")} required />
          <Input label="Email address" type="email" placeholder="billing@acme.com" value={fields.email} onChange={set("email")} />
          <Input label="Company"       placeholder="Acme Corp."      value={fields.company} onChange={set("company")} />
          {error !== null && <p role="alert" className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="submit" isLoading={loading}>{loading ? "Saving…" : "Save Client"}</Button>
            <Link href="/dashboard/clients"><Button variant="secondary" type="button">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

import type React from "react";
