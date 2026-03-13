import type { ApiResponse, Client, CreateClientForm } from "@/lib/types";

async function unwrap<T>(res: Response): Promise<T> {
    const json = (await res.json()) as ApiResponse<T>;
    if (!json.success || json.data === undefined) throw new Error(json.error ?? "Request failed.");
    return json.data;
}

export async function getClients(): Promise<Client[]> {
    return unwrap<Client[]>(await fetch("/api/clients", { cache: "no-store" }));
}

export async function createClient(form: CreateClientForm): Promise<Client> {
    return unwrap<Client>(
        await fetch("/api/clients", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        })
    );
}

export async function deleteClient(id: string): Promise<void> {
    await unwrap<null>(await fetch(`/api/clients/${id}`, { method: "DELETE" }));
}

export async function updateClient(
    id: string,
    data: Partial<Pick<Client, "name" | "email" | "company">>
): Promise<Client> {
    return unwrap<Client>(
        await fetch(`/api/clients/${id}`, {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(data),
        })
    );
}