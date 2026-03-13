"use client";

import {
    createContext, useCallback, useContext,
    useEffect, useRef, useState, type ReactNode,
} from "react";
import { CheckCircle, XCircle, AlertCircle, X, Info, type LucideIcon } from "lucide-react"; // 👈 add LucideIcon



type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
    id:      string;
    type:    ToastType;
    title:   string;
    message?: string;
}

interface ToastContextValue {
    toast: (type: ToastType, title: string, message?: string) => void;
    success: (title: string, message?: string) => void;
    error:   (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info:    (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const CONFIG: Record<ToastType, { icon: LucideIcon; bg: string; border: string; icon_color: string }> = {
    success: { icon: CheckCircle, bg: "bg-white", border: "border-emerald-200", icon_color: "text-emerald-500" },
    error:   { icon: XCircle,     bg: "bg-white", border: "border-red-200",     icon_color: "text-red-500"     },
    warning: { icon: AlertCircle, bg: "bg-white", border: "border-amber-200",   icon_color: "text-amber-500"   },
    info:    { icon: Info,        bg: "bg-white", border: "border-blue-200",    icon_color: "text-blue-500"    },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const { icon: Icon, bg, border, icon_color } = CONFIG[toast.type];
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined); // ✅ fixed

    useEffect(() => {
        timerRef.current = setTimeout(() => onDismiss(toast.id), 4000);
        return () => {
            if (timerRef.current !== undefined) clearTimeout(timerRef.current); // ✅ fixed
        };
    }, [toast.id, onDismiss]);

    return (
        <div className={`flex items-start gap-3 ${bg} border ${border} rounded-xl px-4 py-3 shadow-lg w-80 animate-in slide-in-from-right-5 fade-in duration-300`}>
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${icon_color}`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{toast.title}</p>
                {toast.message && <p className="text-xs text-slate-500 mt-0.5">{toast.message}</p>}
            </div>
            <button onClick={() => onDismiss(toast.id)} className="text-slate-400 hover:text-slate-600 transition-colors shrink-0">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((type: ToastType, title: string, message?: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev.slice(-4), { id, type, title, message }]);
    }, []);

    const value: ToastContextValue = {
        toast,
        success: (t, m) => toast("success", t, m),
        error:   (t, m) => toast("error",   t, m),
        warning: (t, m) => toast("warning", t, m),
        info:    (t, m) => toast("info",    t, m),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onDismiss={dismiss} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
    return ctx;
}
