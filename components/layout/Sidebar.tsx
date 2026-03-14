"use client";

import Link            from "next/link";
import { usePathname } from "next/navigation";
import { useAuth }     from "@/hooks/useAuth";
import { Button }      from "@/components/ui/Button";
import { cn }          from "@/lib/utils";

const NAV = [
  { href: "/dashboard",          icon: "⬡", label: "Overview"  },
  { href: "/dashboard/clients",  icon: "◉", label: "Clients"   },
  { href: "/dashboard/invoices", icon: "◧", label: "Invoices"  },
  { href: "/dashboard/settings", icon: "◌", label: "Settings"  },
];

interface SidebarProps { isOpen: boolean; onClose: () => void; }

// @ts-ignore
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname       = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose} aria-hidden="true" />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col w-64",
        "bg-white border-r border-slate-100",
        "transition-transform duration-300 ease-in-out",
        "lg:relative lg:z-auto lg:translate-x-0",
        isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 px-5 border-b border-slate-100 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">B</span>
          </div>
          <span className="font-semibold text-slate-800 tracking-tight">Billflow</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-5 px-3">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Navigation
          </p>
          <ul className="space-y-0.5">
            {NAV.map(({ href, icon, label }) => {
              const active = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                      active
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                  >
                    <span
                      className={cn("text-base w-5 text-center shrink-0",
                        active ? "text-indigo-600" : "text-slate-400")}
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User footer */}
        <div className="shrink-0 px-4 py-4 border-t border-slate-100 space-y-3">
          {user !== null && (
            <div className="flex items-center gap-3 px-2">
              <div className="w-7 h-7 rounded-full bg-indigo-600 shrink-0 flex items-center justify-center text-white text-xs font-bold">
                {user.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost" size="sm" fullWidth
            onClick={() => { void logout(); }}
            className="justify-start text-slate-500"
          >
            ↩ Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}
