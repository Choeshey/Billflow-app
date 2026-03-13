"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter }   from "next/navigation";
import { useAuth }     from "@/hooks/useAuth";
import { Sidebar }     from "@/components/layout/Sidebar";
import { Header }      from "@/components/layout/Header";
import { Spinner }     from "@/components/ui/Spinner";

const TITLES: Record<string, string> = {
  "/dashboard":          "Overview",
  "/dashboard/clients":  "Clients",
  "/dashboard/invoices": "Invoices",
  "/dashboard/settings": "Settings",
};

export default function DashboardLayout({ children }: { children: ReactNode }): JSX.Element {
  const { user, loading }     = useAuth();
  const router                = useRouter();
  const [sidebar, setSidebar] = useState(false);
  const [title,   setTitle]   = useState("Dashboard");

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    const path   = window.location.pathname;
    const found  = Object.entries(TITLES).find(([k]) => path.startsWith(k));
    if (found) setTitle(found[1]);
  }, []);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar isOpen={sidebar} onClose={() => setSidebar(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={title} onMenuClick={() => setSidebar((p) => !p)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
