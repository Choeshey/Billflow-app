"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useSearchParams } from "next/navigation";
import { DollarSign, Users, FileText, TrendingUp,
    ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Zap, Crown, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface SubData {
    plan:        "FREE" | "PRO";
    active:      boolean;
    renewalDate: string | null;
}

const FREE_FEATURES = [
    "Up to 5 invoices",
    "Unlimited clients",
    "Basic dashboard",
    "Email support",
];

const PRO_FEATURES = [
    "Unlimited invoices",
    "Unlimited clients",
    "Advanced analytics",
    "PDF invoice export",
    "Priority support",
    "Early access to new features",
];

export default function SubscriptionPage() {
    const [sub,      setSub]      = useState<SubData | null>(null);
    const [loading,  setLoading]  = useState(true);
    const [upgrading, setUpgrading] = useState(false);
    const { success, error, info } = useToast();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Handle Stripe redirect
        if (searchParams.get("success") === "true") {
            success("You're now on PRO! 🎉", "All limits have been removed.");
        }
        if (searchParams.get("canceled") === "true") {
            info("Upgrade canceled", "You're still on the FREE plan.");
        }

        fetch("/api/subscription")
            .then(r => r.json())
            .then(json => { if (json.success) setSub(json.data); })
            .finally(() => setLoading(false));
    }, []);

    const handleUpgrade = async () => {
        setUpgrading(true);
        try {
            const res  = await fetch("/api/subscription/checkout", { method: "POST" });
            const json = await res.json();
            if (json.success && json.data?.url) {
                window.location.href = json.data.url; // redirect to Stripe
            } else {
                error("Failed to start checkout", json.error ?? "Please try again.");
            }
        } catch {
            error("Something went wrong", "Please try again.");
        } finally {
            setUpgrading(false);
        }
    };

    const isPro = sub?.plan === "PRO" && sub?.active;

    if (loading) {
        return (
            <div className="p-8 max-w-4xl mx-auto space-y-4 animate-pulse">
                <div className="h-8 w-48 bg-slate-200 rounded-lg" />
                <div className="grid grid-cols-2 gap-6">
                    <div className="h-96 bg-slate-200 rounded-2xl" />
                    <div className="h-96 bg-slate-200 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Subscription</h1>
                <p className="text-slate-500 text-sm mt-1">
                    You are currently on the{" "}
                    <span className={`font-semibold ${isPro ? "text-violet-600" : "text-slate-700"}`}>
            {sub?.plan ?? "FREE"} plan
          </span>
                    {sub?.renewalDate && isPro && (
                        <span className="text-slate-400">
              {" "}· renews {new Date(sub.renewalDate).toLocaleDateString()}
            </span>
                    )}
                </p>
            </div>

            {/* Current usage warning for FREE users */}
            {!isPro && (
                <UsageWarning userId={undefined} />
            )}

            {/* Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FREE */}
                <div className={`bg-white rounded-2xl border-2 p-6 space-y-6 ${!isPro ? "border-slate-800" : "border-slate-100"}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="w-5 h-5 text-slate-500" />
                                <h2 className="font-bold text-slate-800 text-lg">FREE</h2>
                                {!isPro && (
                                    <span className="text-xs bg-slate-800 text-white px-2 py-0.5 rounded-full">Current</span>
                                )}
                            </div>
                            <p className="text-3xl font-bold text-slate-800">$0<span className="text-sm font-normal text-slate-400">/month</span></p>
                        </div>
                    </div>
                    <ul className="space-y-3">
                        {FREE_FEATURES.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                <CheckCircle className="w-4 h-4 text-slate-400 shrink-0" />
                                {f}
                            </li>
                        ))}
                    </ul>
                    <button
                        disabled
                        className="w-full py-2.5 rounded-xl text-sm font-medium bg-slate-100 text-slate-400 cursor-not-allowed"
                    >
                        Current Plan
                    </button>
                </div>

                {/* PRO */}
                <div className={`rounded-2xl border-2 p-6 space-y-6 ${isPro ? "bg-violet-600 border-violet-600" : "bg-violet-600 border-violet-600"}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Crown className="w-5 h-5 text-violet-200" />
                                <h2 className="font-bold text-white text-lg">PRO</h2>
                                {isPro && (
                                    <span className="text-xs bg-white text-violet-600 px-2 py-0.5 rounded-full font-semibold">Active</span>
                                )}
                            </div>
                            <p className="text-3xl font-bold text-white">$12<span className="text-sm font-normal text-violet-300">/month</span></p>
                        </div>
                    </div>
                    <ul className="space-y-3">
                        {PRO_FEATURES.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-violet-100">
                                <CheckCircle className="w-4 h-4 text-violet-300 shrink-0" />
                                {f}
                            </li>
                        ))}
                    </ul>
                    {isPro ? (
                        <button
                            disabled
                            className="w-full py-2.5 rounded-xl text-sm font-medium bg-white/20 text-white cursor-not-allowed"
                        >
                            ✓ You're on PRO
                        </button>
                    ) : (
                        <button
                            onClick={handleUpgrade}
                            disabled={upgrading}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold bg-white text-violet-600 hover:bg-violet-50 transition-colors font-semibold disabled:opacity-70"
                        >
                            {upgrading ? "Redirecting to Stripe…" : "Upgrade to PRO →"}
                        </button>
                    )}
                </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
                <h3 className="font-semibold text-slate-800">Frequently asked questions</h3>
                <div className="space-y-4 text-sm">
                    {[
                        ["Can I cancel anytime?",          "Yes — cancel anytime from your Stripe billing portal. You keep PRO until the end of your billing period."],
                        ["What happens when I hit the limit?", "You'll see a message when you try to create your 6th invoice. Existing invoices are unaffected."],
                        ["Is my payment secure?",           "Yes — payments are handled by Stripe. We never store your card details."],
                    ].map(([q, a], i) => (
                        <div key={i}>
                            <p className="font-medium text-slate-700">{q}</p>
                            <p className="text-slate-500 mt-0.5">{a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Usage Warning Banner ───────────────────────────────────────────────────
function UsageWarning({ userId }: { userId: undefined }) {
    const [count, setCount] = useState<number | null>(null);
    const LIMIT = 5;

    useEffect(() => {
        fetch("/api/invoices")
            .then(r => r.json())
            .then(json => { if (json.success) setCount(json.data.length); });
    }, []);

    if (count === null || count === 0) return null;

    const pct = Math.round((count / LIMIT) * 100);

    return (
        <div className={`rounded-xl border p-4 flex items-start gap-3 ${count >= LIMIT ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
            <AlertCircle className={`w-5 h-5 mt-0.5 shrink-0 ${count >= LIMIT ? "text-red-500" : "text-amber-500"}`} />
            <div className="flex-1">
                <p className={`text-sm font-semibold ${count >= LIMIT ? "text-red-700" : "text-amber-700"}`}>
                    {count >= LIMIT ? "Invoice limit reached" : `${count} of ${LIMIT} invoices used`}
                </p>
                <p className={`text-xs mt-0.5 ${count >= LIMIT ? "text-red-600" : "text-amber-600"}`}>
                    {count >= LIMIT
                        ? "Upgrade to PRO to create unlimited invoices."
                        : `You have ${LIMIT - count} invoice${LIMIT - count === 1 ? "" : "s"} remaining on the FREE plan.`}
                </p>
                <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${count >= LIMIT ? "bg-red-500" : "bg-amber-500"}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
