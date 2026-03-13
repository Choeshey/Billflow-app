"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Input, Button } from "@/components/ui";

interface Fields {
  name:            string;
  email:           string;
  password:        string;
  confirmPassword: string;
}

// @ts-ignore
export default function RegisterPage(): JSX.Element {
  const router = useRouter();
  const [fields,  setFields]  = useState<Fields>({ name: "", email: "", password: "", confirmPassword: "" });
  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (fields.password !== fields.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    if (fields.password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:     fields.name,
          email:    fields.email,
          password: fields.password,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error ?? "Registration failed.");
        return;
      }

      // Auto login after register
      const loginRes  = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: fields.email, password: fields.password }),
      });
      const loginJson = await loginRes.json();

      if (loginJson.success) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>): void =>
      setFields(p => ({ ...p, [k]: e.target.value }));

  return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-violet-600 rounded-xl mb-4">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
            <p className="text-slate-500 text-sm mt-1">Start managing clients and invoices for free</p>
          </div>

          <Card>
            <form onSubmit={(e) => { void handleSubmit(e); }} noValidate className="space-y-4">
              <Input
                  label="Full name"
                  placeholder="John Smith"
                  value={fields.name}
                  onChange={set("name")}
                  required
              />
              <Input
                  label="Email address"
                  type="email"
                  placeholder="john@example.com"
                  value={fields.email}
                  onChange={set("email")}
                  required
              />
              <Input
                  label="Password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={fields.password}
                  onChange={set("password")}
                  required
              />
              <Input
                  label="Confirm password"
                  type="password"
                  placeholder="Repeat your password"
                  value={fields.confirmPassword}
                  onChange={set("confirmPassword")}
                  required
              />

              {error !== null && (
                  <p role="alert" className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
              )}

              <Button type="submit" isLoading={loading} className="w-full">
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </Card>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="text-violet-600 hover:text-violet-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
  );
}

import type React from "react";
