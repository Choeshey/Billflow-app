import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?:    string;
  title:    string;
  detail?:  string;
  action?:  ReactNode;
}

export function EmptyState({ icon = "📄", title, detail, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <span className="text-4xl" aria-hidden="true">{icon}</span>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {detail && <p className="text-xs text-slate-400 max-w-xs">{detail}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
