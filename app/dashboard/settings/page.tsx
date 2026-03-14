"use client";

import { useEffect, useState } from "react";
import { useAuth }   from "@/hooks/useAuth";
import { Card }      from "@/components/ui/Card";
import { Button }    from "@/components/ui/Button";
import { Spinner }   from "@/components/ui/Spinner";
import { Avatar }    from "@/components/ui/Avatar";
import type { Subscription, SubscriptionPlan } from "@/lib/types";
import { formatDate } from "@/lib/utils";

// @ts-ignore
export default function SettingsPage() {
    const { user, logout, setUser } = useAuth();
    const [sub,      setSub]      = useState<Subscription | null>(null);
    const [loading,  setLoading]  = useState(true);
    const [upgrading, setUpgrading] = useState(false);

    useEffect(() => {
        fetch("/api/subscription")
            .then((r) => r.json())
            .then((j: { success: boolean; data?: Subscription }) => { if (j.data) setSub(j.data); })
            .finally(() => setLoading(false));
    }, []);

    const changePlan = async (plan: SubscriptionPlan): Promise<void> => {
        setUpgrading(true);
        try {
            const res  = await fetch("/api/subscription", {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan }),
            });
            const json = (await res.json()) as { success: boolean; data?: Subscription };
            if (json.data) setSub(json.data);
        } finally { setUpgrading(false); }
    };

    return (
        <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Settings</h2>
                <p className="text-sm text-slate-500 mt-0.5">Manage your account and subscription</p>
            </div>

            {/* Profile */}
            <Card>
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Profile</h3>
                <div className="flex items-center gap-4">
                    {/* 👇 Avatar with upload — hover to see camera icon */}
                    <Avatar
                        name={user?.name ?? "User"}
                        imageUrl={user?.avatarUrl}
                        size="xl"
                        editable={true}
                        onUpload={(url) => {
                            if (setUser) setUser((u: typeof user) => u ? { ...u, avatarUrl: url } : u);
                        }}
                    />
                    <div>
                        <p className="font-semibold text-slate-800">{user?.name}</p>
                        <p className="text-sm text-slate-500">{user?.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {user?.role}
            </span>
                        <p className="text-xs text-slate-400 mt-2">
                            Click avatar to upload a photo
                        </p>
                    </div>
                </div>
            </Card>

            {/* Subscription */}
            <Card>
                <h3 className="text-sm font-semibold text-slate-800 mb-4">Subscription</h3>
                {loading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                ) : sub ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-800">
                                    {sub.plan === "PRO" ? "Pro Plan" : "Free Plan"}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {sub.plan === "PRO" && sub.renewalDate
                                        ? `Renews ${formatDate(sub.renewalDate)}`
                                        : "Upgrade to unlock all features"}
                                </p>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                sub.plan === "PRO" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
                            }`}>
                {sub.plan}
              </span>
                        </div>

                        {/* Plan cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <PlanCard
                                name="Free" price="$0/mo"
                                features={["Up to 3 clients", "Up to 10 invoices", "Basic dashboard"]}
                                current={sub.plan === "FREE"}
                                onSelect={() => { void changePlan("FREE"); }}
                                loading={upgrading}
                            />
                            <PlanCard
                                name="Pro" price="$29/mo"
                                features={["Unlimited clients", "Unlimited invoices", "Priority support", "Advanced analytics"]}
                                current={sub.plan === "PRO"}
                                onSelect={() => { void changePlan("PRO"); }}
                                loading={upgrading}
                                highlight
                            />
                        </div>
                    </div>
                ) : null}
            </Card>

            {/* Danger zone */}
            <Card>
                <h3 className="text-sm font-semibold text-red-600 mb-4">Danger Zone</h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-700">Sign out</p>
                        <p className="text-xs text-slate-400">You will be redirected to the login page.</p>
                    </div>
                    <Button variant="danger" onClick={() => { void logout(); }}>Sign Out</Button>
                </div>
            </Card>
        </div>
    );
}

// @ts-ignore
function PlanCard({ name, price, features, current, onSelect, loading, highlight = false }: {
    name:      string;
    price:     string;
    features:  string[];
    current:   boolean;
    onSelect:  () => void;
    loading:   boolean;
    highlight?: boolean;
}) {
    return (
        <div className={`border rounded-xl p-4 ${highlight ? "border-indigo-200 bg-indigo-50/40" : "border-slate-200"}`}>
            <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-slate-800">{name}</p>
                {current && <span className="text-[10px] font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">Current</span>}
            </div>
            <p className="text-lg font-bold text-slate-800 mb-3">{price}</p>
            <ul className="space-y-1.5 mb-4">
                {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="text-emerald-500" aria-hidden="true">✓</span> {f}
                    </li>
                ))}
            </ul>
            <Button
                fullWidth
                variant={current ? "secondary" : "primary"}
                size="sm"
                disabled={current}
                isLoading={loading}
                onClick={onSelect}
            >
                {current ? "Current Plan" : `Switch to ${name}`}
            </Button>
        </div>
    );
}
