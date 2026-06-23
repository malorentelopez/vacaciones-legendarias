"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Gem } from "lucide-react";
import { cn } from "@repo/ui";

export function CrystalCounter({
  crystals,
  compact = false,
}: {
  crystals: number;
  compact?: boolean;
}) {
  const prev = useRef(crystals);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (crystals > prev.current) {
      setBump(true);
      const timer = setTimeout(() => setBump(false), 650);
      prev.current = crystals;
      return () => clearTimeout(timer);
    }
    prev.current = crystals;
  }, [crystals]);

  return (
    <Link
      href="/store"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 font-semibold text-amber-300 transition-colors hover:border-amber-400/50 hover:bg-amber-500/15",
        compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
        bump && "crystal-counter-bump"
      )}
      title="Ir al mercader"
      aria-label={`${crystals} cristales. Ir al mercader`}
    >
      <Gem className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
      <span>{crystals}</span>
      <span aria-hidden>💎</span>
    </Link>
  );
}
