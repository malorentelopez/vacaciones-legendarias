"use client";

import { cn } from "@repo/ui";

interface MangaHudBarProps {
  value: number;
  label?: string;
  className?: string;
  barStyle?: React.CSSProperties;
  showValue?: boolean;
}

export function MangaHudBar({
  value,
  label,
  className,
  barStyle,
  showValue = true,
}: MangaHudBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("space-y-1", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label && <span className="font-display text-[11px] text-[var(--theme-heading)]">{label}</span>}
          {showValue && <span>{clamped}%</span>}
        </div>
      )}
      <div className="manga-hud-bar">
        <div className="manga-hud-bar-fill" style={{ width: `${clamped}%`, ...barStyle }} />
      </div>
    </div>
  );
}
