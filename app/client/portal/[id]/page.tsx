"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Calendar, FileText, CreditCard, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface InvoiceDetail {
    id:        string;
    amount:    number;
    status:    string;
    issueDate: string;
    dueDate:   string;
    notes:     string | null;
    createdAt: string;
    client:    { name: string; email: string | null; company: string | null };
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
    return new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

// @ts-ignore
export default function ClientInvoiceDetailPage(): JSX.Element {
    const { id }       = useParams<{ id: string }>();
    const router       = useRouter();
    const searchParams = useSearchParams();
    const { success, info } = useToast();

    const [invoice,  setInvoice]  = useState<InvoiceDetail | null>(null);
    const [loading,  setLoading]  = useState(true);
    const [paying,   setPaying]   = useState(false);

    useEffect(() => {
        // Handle Stripe redirect
        if (searchParams.get("paid") === "true") {
            success("Payment successful! 🎉", "Your invoice has been marked as paid.");
        }
        if (searchParams.get("canceled") === "true") {
            info("Payment canceled", "Your invoice has not been paid.");
        }

        fetch(`/api/client-portal/invoices/${id}`)
            .then(r => {
                if (r.status === 401) { router.push("/client/login"); return null; }
                return r.json();
            })
            .then(json => { if (json?.success) setInvoice(json.data); })
            .finally(() => setLoading(false));
    }, [id]);

    const handlePayNow = async () => {
        setPaying(true);
        try {
            const res  = await fetch(`/api/client-portal/invoices/${id}/pay`, { method: "POST" });
            const json = await res.json();
            if (json.success && json.data?.url) {
                window.location.href = json.data.url;
            } else {
                alert(json.error ?? "Failed to start payment.");
            }
        } catch {
            alert("Something went wrong. Please try again.");
        } finally {
            setPaying(false);
        }
    };

    const handleDownloadPDF = async () => {
        const res = await fetch(`/api/client-portal/invoices/${id}/pdf`);
        if (!res.ok) { alert("PDF download failed."); return; }
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = `invoice-${id.slice(0, 8)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <div className="text-center">
            <p className="text-gray-400">Invoice not found.</p>
        <Link href="/client/portal" className="text-emerald-400 text-sm mt-2 inline-block">← Back to portal</Link>
        </div>
        </div>
    );
    }

    const status    = STATUS_CONFIG[invoice.status] ?? STATUS_CONFIG.DRAFT;
    const canPay    = invoice.status === "SENT" || invoice.status === "OVERDUE";
    const isPaid    = invoice.status === "PAID";

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Topbar */}
            <header className="border-b border-gray-800 px-6 py-4">
    <div className="max-w-2xl mx-auto flex items-center justify-between">
    <Link href="/client/portal" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
    <ArrowLeft className="w-4 h-4" />
        Back to invoices
    </Link>
    <div className="flex items-center gap-2">
    <button
        onClick={handleDownloadPDF}
    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-xl transition-colors border border-gray-700"
    >
    <Download className="w-4 h-4" />
        Download PDF
    </button>
    {canPay && (
        <button
            onClick={handlePayNow}
        disabled={paying}
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
        <CreditCard className="w-4 h-4" />
            {paying ? "Redirecting…" : "Pay Now"}
            </button>
    )}
    </div>
    </div>
    </header>

    <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Paid banner */}
    {isPaid && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
            <p className="text-sm font-semibold text-emerald-400">Payment received</p>
    <p className="text-xs text-emerald-600 mt-0.5">This invoice has been paid. Thank you!</p>
    </div>
    </div>
    )}

    {/* Invoice Header */}
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
    <div className="flex items-start justify-between mb-6">
    <div className="flex items-center gap-3">
    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
    <FileText className="w-5 h-5 text-emerald-400" />
    </div>
    <div>
    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Invoice</p>
        <p className="text-sm font-mono text-white mt-0.5">#{invoice.id.slice(0, 8).toUpperCase()}</p>
    </div>
    </div>
    <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${status.className}`}>
    {status.label}
    </span>
    </div>

    {/* Amount */}
    <div className="border-t border-gray-800 pt-6 mb-6">
    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Amount Due</p>
    <p className="text-4xl font-bold text-white">{formatCurrency(invoice.amount)}</p>
    </div>

    {/* Dates */}
    <div className="grid grid-cols-2 gap-4">
    <div className="bg-gray-800/50 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-1">
    <Calendar className="w-3.5 h-3.5 text-gray-400" />
    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Issue Date</p>
    </div>
    <p className="text-sm font-medium text-white">{formatDate(invoice.issueDate)}</p>
    </div>
    <div className="bg-gray-800/50 rounded-xl p-4">
    <div className="flex items-center gap-2 mb-1">
    <Calendar className="w-3.5 h-3.5 text-gray-400" />
    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Due Date</p>
    </div>
    <p className={`text-sm font-medium ${invoice.status === "OVERDUE" ? "text-red-400" : "text-white"}`}>
    {formatDate(invoice.dueDate)}
    </p>
    </div>
    </div>

    {/* Notes */}
    {invoice.notes && (
        <div className="mt-4 bg-gray-800/50 rounded-xl p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Notes</p>
            <p className="text-sm text-gray-300">{invoice.notes}</p>
        </div>
    )}
    </div>

    {/* Billing Info */}
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-4">Billed To</p>
    <p className="font-semibold text-white">{invoice.client.name}</p>
    {invoice.client.company && <p className="text-sm text-gray-400 mt-0.5">{invoice.client.company}</p>}
        {invoice.client.email   && <p className="text-sm text-gray-400 mt-0.5">{invoice.client.email}</p>}
            </div>

            {/* Pay CTA for unpaid invoices */}
            {canPay && (
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex items-center justify-between">
                <div>
                    <p className="font-semibold text-white">Ready to pay?</p>
                <p className="text-sm text-gray-400 mt-0.5">Secure payment powered by Stripe</p>
            </div>
            <button
                onClick={handlePayNow}
                disabled={paying}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                <CreditCard className="w-4 h-4" />
                    {paying ? "Redirecting…" : `Pay ${formatCurrency(invoice.amount)}`}
                    </button>
                    </div>
            )}
            </main>
            </div>
        );
        }
