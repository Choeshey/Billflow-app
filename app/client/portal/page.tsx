"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, DollarSign, Clock, CheckCircle, LogOut } from "lucide-react";

interface Invoice {
    id:        string;
    amount:    number;
    status:    string;
    issueDate: string;
    dueDate:   string;
    createdAt: string;
}

interface Summary {
    totalOwed: number;
    totalPaid: number;
    total:     number;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    PAID:    { label: "Paid",    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    SENT:    { label: "Sent",    className: "bg-blue-500/10 text-blue-400 border-blue-500/20"          },
    DRAFT:   { label: "Draft",   className: "bg-gray-500/10 text-gray-400 border-gray-500/20"          },
    OVERDUE: { label: "Overdue", className: "bg-red-500/10 text-red-400 border-red-500/20"             },
};

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// @ts-ignore
export default function ClientPortalPage() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [summary,  setSummary]  = useState<Summary | null>(null);
    const [loading,  setLoading]  = useState(true);
    const [clientName, setClientName] = useState("");

    useEffect(() => {
        fetch("/api/client-portal/invoices")
            .then(r => {
                if (r.status === 401) { router.push("/client/login"); return null; }
                return r.json();
            })
            .then(json => {
                if (!json) return;
                if (json.success) {
                    setInvoices(json.data.invoices);
                    setSummary(json.data.summary);
                }
            })
            .finally(() => setLoading(false));

        // Get client name from cookie via me endpoint
        fetch("/api/client-auth/me")
            .then(r => r.json())
            .then(json => { if (json.success) setClientName(json.data.name); })
            .catch(() => null);
    }, []);

    const handleLogout = async () => {
        await fetch("/api/client-auth/logout", { method: "POST" });
        router.push("/client/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Topbar */}
            <header className="border-b border-gray-800 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Client Portal</p>
                            {clientName && <p className="text-xs text-gray-400">{clientName}</p>}
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Invoices</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{summary.total}</p>
                        </div>
                        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-amber-500/10 rounded-lg">
                                    <Clock className="w-4 h-4 text-amber-400" />
                                </div>
                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Amount Owed</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalOwed)}</p>
                        </div>
                        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                </div>
                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Paid</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalPaid)}</p>
                        </div>
                    </div>
                )}

                {/* Invoices Table */}
                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-800">
                        <h2 className="font-semibold text-white">Your Invoices</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total</p>
                    </div>

                    {invoices.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="p-4 bg-gray-800 rounded-2xl mb-4">
                                <FileText className="w-8 h-8 text-gray-600" />
                            </div>
                            <p className="text-gray-400 font-medium">No invoices yet</p>
                            <p className="text-gray-600 text-sm mt-1">Your invoices will appear here</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-800">
                            {invoices.map(inv => {
                                const status = STATUS_CONFIG[inv.status] ?? STATUS_CONFIG.DRAFT;
                                return (
                                    <Link
                                        key={inv.id}
                                        href={`/client/portal/${inv.id}`}
                                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/50 transition-colors"
                                    >
                                        <div className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center shrink-0">
                                            <DollarSign className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white">Invoice</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Issued {formatDate(inv.issueDate)} · Due {formatDate(inv.dueDate)}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status.className}`}>
                      {status.label}
                    </span>
                                        <p className="text-sm font-bold text-white tabular-nums shrink-0">
                                            {formatCurrency(inv.amount)}
                                        </p>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
