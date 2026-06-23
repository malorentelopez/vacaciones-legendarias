"use client";

import { useEffect } from "react";

interface BossVictoryCelebrationProps {
  title: string;
  xpReward: number;
  crystalReward: number;
  onComplete?: () => void;
}

const PARTICLE_COUNT = 14;

export function BossVictoryCelebration({
  title,
  xpReward,
  crystalReward,
  onComplete,
}: BossVictoryCelebrationProps) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="reward-celebration pointer-events-none fixed inset-0 z-[60] flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={`¡Boss derrotado! ${title}`}
    >
      <div className="reward-celebration-flash absolute inset-0 bg-red-500/10" />

      <div className="reward-celebration-burst relative flex flex-col items-center px-6 text-center">
        <div className="reward-celebration-trophy rounded-full bg-red-500/20 p-5 ring-4 ring-red-400/40">
          <span className="block text-5xl" aria-hidden>
            🐉
          </span>
        </div>
        <p className="reward-celebration-title mt-5 font-display text-3xl font-bold text-red-300">
          ¡K.O.!
        </p>
        <p className="mt-1 text-xl font-bold text-amber-200">¡Boss derrotado!</p>
        <p className="mt-1 max-w-xs text-base text-slate-200">{title}</p>
        <div className="reward-celebration-amount mt-3 flex flex-wrap justify-center gap-3 text-lg font-bold">
          {xpReward > 0 && <span className="text-violet-300">+{xpReward} XP</span>}
          {crystalReward > 0 && <span className="text-emerald-400">+{crystalReward} 💎</span>}
        </div>
      </div>

      {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
        <span
          key={i}
          className="reward-celebration-particle absolute text-2xl"
          style={
            {
              "--particle-index": i,
              "--particle-angle": `${(i / PARTICLE_COUNT) * 360}deg`,
            } as React.CSSProperties
          }
          aria-hidden
        >
          {i % 3 === 0 ? "⚔️" : i % 3 === 1 ? "🔥" : "✨"}
        </span>
      ))}
    </div>
  );
}
