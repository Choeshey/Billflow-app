import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider }   from "@/context/AuthContext";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title:       { default: "Billflow", template: "%s | Billflow" },
  description: "Production SaaS dashboard",
};

// @ts-ignore
export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased"
            suppressHydrationWarning  // 👈 add this
      >

        <AuthProvider>
            <ToastProvider>   {/* 👈 wrap children here */}
            {children}
        </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
