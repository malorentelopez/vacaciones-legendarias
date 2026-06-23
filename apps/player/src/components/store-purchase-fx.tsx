"use client";

import { useEffect } from "react";
import { MangaSfx } from "@/components/manga/manga-sfx";

interface StorePurchaseFxProps {
  onComplete?: () => void;
}

export function StorePurchaseFx({ onComplete }: StorePurchaseFxProps) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 900);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[inherit]">
      <div className="manga-burst-overlay absolute inset-0" />
      <MangaSfx
        text="¡CANJE!"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl"
        durationMs={900}
      />
      <span className="manga-float-reward absolute left-1/2 top-[62%] -translate-x-1/2 text-sm font-bold text-amber-200">
        💎
      </span>
    </div>
  );
}
