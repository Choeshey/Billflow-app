import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const base = "w-full rounded-lg bg-white border text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:cursor-not-allowed";
const err  = "border-red-400 focus:border-red-500 focus:ring-red-100";
const ok   = "border-slate-200";

interface FieldProps {
  label:    string;
  hint?:    string;
  error?:   string;
  children: ReactNode;
  id:       string;
}

function Field({ label, hint, error, children, id }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error ? <p role="alert" className="text-xs text-red-500">{error}</p>
             : hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────────

interface InputOwnProps { label: string; hint?: string; error?: string; }
export type InputProps = InputOwnProps & Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

export function Input({ label, hint, error, id, className, ...rest }: InputProps) {
  const fid = id ?? `f-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <Field label={label} hint={hint} error={error} id={fid}>
      <input id={fid} aria-invalid={!!error}
        className={cn(base, "h-9 px-3", error ? err : ok, className)} {...rest} />
    </Field>
  );
}

// ── Select ─────────────────────────────────────────────────────────────────────

interface SelectOwnProps { label: string; hint?: string; error?: string; children: ReactNode; }
export type SelectProps = SelectOwnProps & SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ label, hint, error, id, className, children, ...rest }: SelectProps) {
  const fid = id ?? `f-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <Field label={label} hint={hint} error={error} id={fid}>
      <select id={fid} aria-invalid={!!error}
        className={cn(base, "h-9 px-3 cursor-pointer", error ? err : ok, className)} {...rest}>
        {children}
      </select>
    </Field>
  );
}

// ── Textarea ───────────────────────────────────────────────────────────────────

interface TextareaOwnProps { label: string; hint?: string; error?: string; }
export type TextareaProps = TextareaOwnProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ label, hint, error, id, className, ...rest }: TextareaProps) {
  const fid = id ?? `f-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <Field label={label} hint={hint} error={error} id={fid}>
      <textarea id={fid} aria-invalid={!!error} rows={3}
        className={cn(base, "px-3 py-2 resize-none", error ? err : ok, className)} {...rest} />
    </Field>
  );
}
