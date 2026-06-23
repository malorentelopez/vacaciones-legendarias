"use client";

import { useEffect } from "react";

interface LevelUpCelebrationProps {
  newLevel: number;
  crystalReward: number;
  onComplete?: () => void;
}

const PARTICLE_COUNT = 12;

export function LevelUpCelebration({ newLevel, crystalReward, onComplete }: LevelUpCelebrationProps) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="reward-celebration pointer-events-none fixed inset-0 z-[60] flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={`¡Subida de nivel! Nivel ${newLevel}`}
    >
      <div className="reward-celebration-flash absolute inset-0" />

      <div className="reward-celebration-burst relative flex flex-col items-center px-6 text-center">
        <div className="reward-celebration-trophy rounded-full bg-violet-500/20 p-5 ring-4 ring-violet-400/40">
          <span className="block text-5xl" aria-hidden>
            ⭐
          </span>
        </div>
        <p className="reward-celebration-title mt-5 text-2xl font-bold text-violet-300">
          ¡Subida de nivel!
        </p>
        <p className="mt-2 text-4xl font-bold text-white">Nv. {newLevel}</p>
        <p className="mt-1 max-w-xs text-base text-slate-200">Tu héroe crece más fuerte</p>
        {crystalReward > 0 && (
          <p className="reward-celebration-amount mt-3 text-3xl font-bold text-emerald-400">
            +{crystalReward} 💎
          </p>
        )}
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
          {i % 3 === 0 ? "⭐" : i % 3 === 1 ? "✨" : "💫"}
        </span>
      ))}
    </div>
  );
}
