"use client";

import { useCallback, useEffect, useState } from "react";
import type { Invoice, CreateInvoiceForm, InvoiceStatus, FetchState } from "@/lib/types";
import { getInvoices, createInvoice, updateInvoiceStatus, deleteInvoice } from "@/services/invoiceService";

export interface UseInvoicesReturn {
  state:        FetchState<Invoice[]>;
  create:       (form: CreateInvoiceForm) => Promise<void>;
  updateStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  remove:       (id: string) => Promise<void>;
  refresh:      () => void;
}

export function useInvoices(): UseInvoicesReturn {
  const [state, setState] = useState<FetchState<Invoice[]>>({ status: "idle" });

  const fetchAll = useCallback((): void => {
    setState({ status: "loading" });
    getInvoices()
      .then((data) => setState({ status: "success", data }))
      .catch((err: unknown) =>
        setState({ status: "error", error: err instanceof Error ? err.message : "Failed." })
      );
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = useCallback(async (form: CreateInvoiceForm): Promise<void> => {
    const inv = await createInvoice(form);
    setState((prev) =>
      prev.status === "success" ? { status: "success", data: [inv, ...prev.data] } : prev
    );
  }, []);

  const updateStatus = useCallback(async (id: string, status: InvoiceStatus): Promise<void> => {
    const updated = await updateInvoiceStatus(id, status);
    setState((prev) =>
      prev.status === "success"
        ? { status: "success", data: prev.data.map((i) => (i.id === id ? updated : i)) }
        : prev
    );
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    await deleteInvoice(id);
    setState((prev) =>
      prev.status === "success"
        ? { status: "success", data: prev.data.filter((i) => i.id !== id) }
        : prev
    );
  }, []);

  return { state, create, updateStatus, remove, refresh: fetchAll };
}
