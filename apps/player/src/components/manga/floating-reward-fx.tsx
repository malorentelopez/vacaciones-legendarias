"use client";

import { useEffect } from "react";
import { MangaSfx } from "./manga-sfx";

export interface FloatingRewardPayload {
  sfx: string;
  xp: number;
  crystals: number;
}

interface FloatingRewardFxProps extends FloatingRewardPayload {
  onComplete?: () => void;
}

export function FloatingRewardFx({ sfx, xp, crystals, onComplete }: FloatingRewardFxProps) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 900);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[inherit]">
      <div className="manga-burst-overlay absolute inset-0" />
      <MangaSfx
        text={sfx}
        className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 text-3xl sm:text-4xl"
        durationMs={900}
      />
      <span className="manga-float-reward absolute left-1/2 top-[48%] -translate-x-1/2 text-lg font-bold text-violet-300">
        +{xp} XP
      </span>
      {crystals > 0 && (
        <span className="manga-float-reward manga-float-reward-delay absolute left-1/2 top-[58%] -translate-x-1/2 text-lg font-bold text-amber-300">
          +{crystals} 💎
        </span>
      )}
    </div>
  );
}
