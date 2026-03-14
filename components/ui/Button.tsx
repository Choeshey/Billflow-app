import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface ButtonOwnProps {
  variant?:   Variant;
  size?:      Size;
  isLoading?: boolean;
  leftIcon?:  ReactNode;
  fullWidth?: boolean;
  children:   ReactNode;
}

export type ButtonProps = ButtonOwnProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

const V: Record<Variant, string> = {
  primary:   "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
  secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm",
  ghost:     "bg-transparent text-slate-600 hover:bg-slate-100",
  danger:    "bg-red-600 text-white hover:bg-red-700 shadow-sm",
};
const S: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-9 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-5 text-sm gap-2 rounded-xl",
};

export function Button({
  variant = "primary", size = "md", isLoading = false,
  leftIcon, fullWidth = false, disabled, className, children, ...rest
}: ButtonProps) {
  const off = (disabled ?? false) || isLoading;
  return (
    <button
      disabled={off}
      aria-busy={isLoading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        V[variant], S[size],
        off       && "opacity-50 cursor-not-allowed pointer-events-none",
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {isLoading ? <Spinner size="sm" /> : (leftIcon && <span aria-hidden="true">{leftIcon}</span>)}
      <span>{children}</span>
    </button>
  );
}
