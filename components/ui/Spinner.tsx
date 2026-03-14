import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";
const sizes: Record<Size, string> = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
  lg: "w-9 h-9 border-[3px]",
};

export function Spinner({ size = "md", className }: { size?: Size; className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-block animate-spin rounded-full border-slate-200 border-t-indigo-600", sizes[size], className)}
    />
  );
}
