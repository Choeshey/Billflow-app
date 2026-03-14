"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

// @ts-ignore
export default function ClientLoginPage() {
    const router = useRouter();
    const [email,    setEmail]    = useState("");
    const [password, setPassword] = useState("");
    const [error,    setError]    = useState<string | null>(null);
    const [loading,  setLoading]  = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const res  = await fetch("/api/client-auth/login", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ email, password }),
            });
            const json = await res.json();
            if (!json.success) { setError(json.error ?? "Login failed."); return; }
            router.push("/client/portal");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-500 rounded-2xl mb-6 shadow-lg shadow-emerald-500/30">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Client Portal</h1>
                    <p className="text-gray-400 text-sm mt-2">Sign in to view your invoices</p>
                </div>

                {/* Form */}
                <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
                    <form onSubmit={(e) => { void handleSubmit(e); }} noValidate className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                required
                                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Your password"
                                required
                                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {error && (
                            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors text-sm mt-2"
                        >
                            {loading ? "Signing in…" : "Sign in"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-gray-600">
                    Contact your account manager if you need access.
                </p>
            </div>
        </div>
    );
}
