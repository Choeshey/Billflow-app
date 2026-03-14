"use client";

interface HeaderProps {
  title:       string;
  onMenuClick: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 h-16 px-4 lg:px-6 bg-white/90 border-b border-slate-100 backdrop-blur-md">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <h1 className="text-sm font-semibold text-slate-800">{title}</h1>
      <div className="flex-1" />
      <div className="w-2 h-2 rounded-full bg-emerald-400" title="Connected" />
    </header>
  );
}
