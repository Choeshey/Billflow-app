"use client";

import { useCallback, useEffect, useState } from "react";
import type { Client, CreateClientForm, FetchState } from "@/lib/types";
import { getClients, createClient, deleteClient, updateClient } from "@/services/clientService";

export interface UseClientsReturn {
  state:   FetchState<Client[]>;
  create:  (form: CreateClientForm) => Promise<void>;
  remove:  (id: string) => Promise<void>;
  update:  (id: string, data: Partial<Pick<Client, "name" | "email" | "company">>) => Promise<void>;
  refresh: () => void;
}

export function useClients(): UseClientsReturn {
  const [state, setState] = useState<FetchState<Client[]>>({ status: "idle" });

  const fetchAll = useCallback((): void => {
    setState({ status: "loading" });
    getClients()
        .then((data) => setState({ status: "success", data }))
        .catch((err: unknown) =>
            setState({ status: "error", error: err instanceof Error ? err.message : "Failed." })
        );
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const create = useCallback(async (form: CreateClientForm): Promise<void> => {
    const c = await createClient(form);
    setState((prev) =>
        prev.status === "success" ? { status: "success", data: [c, ...prev.data] } : prev
    );
  }, []);

  const remove = useCallback(async (id: string): Promise<void> => {
    await deleteClient(id);
    setState((prev) =>
        prev.status === "success"
            ? { status: "success", data: prev.data.filter((c) => c.id !== id) }
            : prev
    );
  }, []);

  const update = useCallback(async (
      id: string,
      data: Partial<Pick<Client, "name" | "email" | "company">>
  ): Promise<void> => {
    const updated = await updateClient(id, data);
    setState((prev) =>
        prev.status === "success"
            ? { status: "success", data: prev.data.map((c) => c.id === id ? { ...c, ...updated } : c) }
            : prev
    );
  }, []);

  return { state, create, remove, update, refresh: fetchAll };
}