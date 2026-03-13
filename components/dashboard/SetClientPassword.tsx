"use client";

import { useState } from "react";
import { Input, Button, Card } from "@/components/ui";
import { KeyRound, Eye, EyeOff, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface SetClientPasswordProps {
    clientId:   string;
    clientName: string;
}

export function SetClientPassword({ clientId, clientName }: SetClientPasswordProps) {
    const { success, error } = useToast();
    const [password,  setPassword]  = useState("");
    const [show,      setShow]      = useState(false);
    const [loading,   setLoading]   = useState(false);

    // Generate a random strong password
    const generatePassword = () => {
        const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
        const pwd   = Array.from({ length: 12 }, () =>
            chars[Math.floor(Math.random() * chars.length)]
        ).join("");
        setPassword(pwd);
        setShow(true);
    };

    const copyPassword = async () => {
        if (!password) return;
        await navigator.clipboard.writeText(password);
        success("Copied!", "Password copied to clipboard.");
    };

    const handleSave = async () => {
        if (password.length < 8) {
            error("Too short", "Password must be at least 8 characters.");
            return;
        }
        setLoading(true);
        try {
            const res  = await fetch(`/api/clients/${clientId}/password`, {
                method:  "PATCH",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ password }),
            });
            const json = await res.json();
            if (!json.success) {
                error("Failed", json.error ?? "Could not update password.");
                return;
            }
            success("Password updated!", `${clientName} can now log in to the client portal.`);
            setPassword("");
        } catch {
            error("Something went wrong", "Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-violet-100 rounded-lg">
                    <KeyRound className="w-4 h-4 text-violet-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-700">Client Portal Access</h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">
                Set a password so <span className="font-medium text-slate-700">{clientName}</span> can
                log in to <span className="font-mono text-violet-600">/client/login</span> and view their invoices.
            </p>

            <div className="space-y-3">
                {/* Password input */}
                <div className="relative">
                    <Input
                        label="Portal password"
                        type={show ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button
                        type="button"
                        onClick={() => setShow(s => !s)}
                        className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={generatePassword}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition-colors px-3 py-2 rounded-lg border border-slate-200 hover:border-violet-300"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Generate
                    </button>
                    {password && (
                        <button
                            type="button"
                            onClick={copyPassword}
                            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-violet-600 transition-colors px-3 py-2 rounded-lg border border-slate-200 hover:border-violet-300"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                        </button>
                    )}
                    <Button
                        type="button"
                        onClick={handleSave}
                        isLoading={loading}
                        className="ml-auto"
                    >
                        {loading ? "Saving…" : "Save Password"}
                    </Button>
                </div>

                {/* Login info */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-slate-500 font-medium mb-1">Client login details:</p>
                    <p className="text-xs text-slate-600">
                        URL: <span className="font-mono text-violet-600">yourdomain.com/client/login</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">
                        Email: <span className="font-mono text-slate-800">{clientName}</span>'s email address
                    </p>
                </div>
            </div>
        </Card>
    );
}
