"use client";

import { FileText, Users, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon?:        LucideIcon;
    title:        string;
    description?: string;
    action?:      React.ReactNode;
}

export function EmptyState({ icon: Icon = FileText, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="bg-slate-100 rounded-2xl p-5 mb-4">
                <Icon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
            {description && <p className="text-sm text-slate-400 max-w-xs mb-6">{description}</p>}
            {action}
        </div>
    );
}

// ── Pre-built empties ──────────────────────────────────────────────────────
export function NoClients({ onAdd }: { onAdd?: () => void }) {
    return (
        <EmptyState
            icon={Users}
            title="No clients yet"
            description="Add your first client to start creating invoices and tracking payments."
            action={
                onAdd && (
                    <button
                        onClick={onAdd}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        Add Client
                    </button>
                )
            }
        />
    );
}

export function NoInvoices({ onAdd }: { onAdd?: () => void }) {
    return (
        <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Create your first invoice to start getting paid."
            action={
                onAdd && (
                    <button
                        onClick={onAdd}
                        className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        New Invoice
                    </button>
                )
            }
        />
    );
}
