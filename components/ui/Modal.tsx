"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open:     boolean;
  onClose:  () => void;
  title:    string;
  children: ReactNode;
  size?:    "sm" | "md" | "lg";
}

const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className={cn("relative w-full bg-white rounded-2xl shadow-2xl", sizes[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} aria-label="Close"
            className="text-slate-400 hover:text-slate-600 text-lg leading-none transition-colors">✕</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
