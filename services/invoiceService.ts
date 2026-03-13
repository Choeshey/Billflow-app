import type { ApiResponse, Invoice, CreateInvoiceForm, InvoiceStatus } from "@/lib/types";

async function unwrap<T>(res: Response): Promise<T> {
  const json = (await res.json()) as ApiResponse<T>;
  if (!json.success || json.data === undefined) throw new Error(json.error ?? "Request failed.");
  return json.data;
}

export async function getInvoices(): Promise<Invoice[]> {
  return unwrap<Invoice[]>(await fetch("/api/invoices", { cache: "no-store" }));
}

export async function createInvoice(form: CreateInvoiceForm): Promise<Invoice> {
  return unwrap<Invoice>(
    await fetch("/api/invoices", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    })
  );
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
  return unwrap<Invoice>(
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
  );
}

export async function deleteInvoice(id: string): Promise<void> {
  await unwrap<null>(await fetch(`/api/invoices/${id}`, { method: "DELETE" }));
}
