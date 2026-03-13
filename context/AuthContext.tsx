"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User, LoginForm } from "@/lib/types";

interface AuthContextValue {
  user:    User | null;
  loading: boolean;
  login:   (form: LoginForm) => Promise<void>;
  logout:  () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// @ts-ignore
export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router                = useRouter();

  // On mount: try to fetch current user from server session
  useEffect(() => {
    fetch("/api/auth/login", { method: "GET" })
      .then((r) => r.json())
      .then((json: { success: boolean; data?: User }) => {
        if (json.success && json.data) setUser(json.data);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (form: LoginForm): Promise<void> => {
    const res  = await fetch("/api/auth/login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(form),
    });
    const json = (await res.json()) as { success: boolean; data?: User; error?: string };

    if (!json.success || !json.data) {
      throw new Error(json.error ?? "Login failed.");
    }
    setUser(json.data);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, logout }),
    [user, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be inside <AuthProvider>");
  return ctx;
}
