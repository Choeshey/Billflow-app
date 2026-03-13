"use client";

import { useEffect, useState } from "react";
import {
    AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
    DollarSign, Users, TrendingUp,
    ArrowUpRight, ArrowDownRight, Clock, CheckCircle,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Stats {
    totalRevenue:   number;
    totalClients:   number;
    unpaidInvoices: number;
    paidThisMonth:  number;
    revenueChange:  number;
    clientChange:   number;
}
interface RevenuePoint { month: string; revenue: number; }
interface StatusPoint  { name: string; value: number; color: string; }

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
                      title, value, icon: Icon, change, prefix = "", color,
                  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    change?: number;
    prefix?: string;
    color: string;
}) {
    const positive = (change ?? 0) >= 0;
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500">{title}</span>
                <div className={`p-2 rounded-xl ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
            <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-slate-800 tracking-tight">
          {prefix}{value.toLocaleString()}
        </span>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${positive ? "text-emerald-600" : "text-red-500"}`}>
                        {positive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            {change !== undefined && (
                <p className="text-xs text-slate-400 mt-1">vs last month</p>
            )}
        </div>
    );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function DashboardPage() {
    const [stats,    setStats]    = useState<Stats | null>(null);
    const [revenue,  setRevenue]  = useState<RevenuePoint[]>([]);
    const [statuses, setStatuses] = useState<StatusPoint[]>([]);
    const [loading,  setLoading]  = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/dashboard/stats").then(r => r.json()),
            fetch("/api/dashboard/revenue").then(r => r.json()),
            fetch("/api/dashboard/statuses").then(r => r.json()),
        ])
            .then(([s, r, st]) => {
                if (s.success)  setStats(s.data);
                if (r.success)  setRevenue(r.data);
                if (st.success) setStatuses(st.data);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
                <p className="text-slate-500 text-sm mt-1">Welcome back — here's what's happening.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total Revenue"    value={stats?.totalRevenue ?? 0}   icon={DollarSign}    change={stats?.revenueChange} prefix="$" color="bg-violet-500" />
                <StatCard title="Total Clients"    value={stats?.totalClients ?? 0}   icon={Users}         change={stats?.clientChange}              color="bg-blue-500"   />
                <StatCard title="Unpaid Invoices"  value={stats?.unpaidInvoices ?? 0} icon={Clock}                                                    color="bg-amber-500"  />
                <StatCard title="Paid This Month"  value={stats?.paidThisMonth ?? 0}  icon={CheckCircle}                             prefix="$"         color="bg-emerald-500"/>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-semibold text-slate-800">Revenue Over Time</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Last 6 months</p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-violet-500" />
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={revenue}>
                            <defs>
                                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                                   tickFormatter={(v: number) => `$${v.toLocaleString()}`} />
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
                                formatter={(v: number | undefined) => [`$${(v ?? 0).toLocaleString()}`, "Revenue"]}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2}
                                  fill="url(#revenueGrad)" dot={{ fill: "#8b5cf6", r: 3 }} activeDot={{ r: 5 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Invoice Status Pie */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="mb-6">
                        <h2 className="font-semibold text-slate-800">Invoice Status</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Current breakdown</p>
                    </div>
                    {statuses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
                            No invoices yet
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={statuses} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                                         paddingAngle={3} dataKey="value">
                                        {statuses.map((s, i) => <Cell key={i} fill={s.color} />)}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-4">
                                {statuses.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                                            <span className="text-slate-600">{s.name}</span>
                                        </div>
                                        <span className="font-medium text-slate-800">{s.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function DashboardSkeleton() {
    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
                        <div className="flex justify-between">
                            <div className="h-4 w-24 bg-slate-200 rounded" />
                            <div className="h-9 w-9 bg-slate-200 rounded-xl" />
                        </div>
                        <div className="h-8 w-32 bg-slate-200 rounded" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 h-80" />
                <div className="bg-white rounded-2xl p-6 border border-slate-100 h-80" />
            </div>
        </div>
    );
}
