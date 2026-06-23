"use client";

import { useEffect } from "react";
import { MangaSfx } from "@/components/manga/manga-sfx";

interface BossStrikeFxProps {
  ko?: boolean;
  onComplete?: () => void;
}

export function BossStrikeFx({ ko = false, onComplete }: BossStrikeFxProps) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), ko ? 1100 : 850);
    return () => clearTimeout(timer);
  }, [ko, onComplete]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[inherit]">
      <div className="manga-burst-overlay boss-strike-burst absolute inset-0" />
      <MangaSfx
        text={ko ? "¡K.O.!" : "¡GOLPE!"}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl sm:text-5xl"
        durationMs={ko ? 1100 : 850}
      />
    </div>
  );
}
