"use client";

import { useEffect } from "react";

interface RewardCelebrationProps {
  title: string;
  amount: number;
  onComplete?: () => void;
}

const PARTICLE_COUNT = 14;

export function RewardCelebration({ title, amount, onComplete }: RewardCelebrationProps) {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 2600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className="reward-celebration pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label={`Logro reclamado: ${title}, +${amount} cristales`}
    >
      <div className="reward-celebration-flash absolute inset-0" />

      <div className="reward-celebration-burst relative flex flex-col items-center px-6 text-center">
        <div className="reward-celebration-trophy rounded-full bg-amber-500/20 p-5 ring-4 ring-amber-400/40">
          <span className="block text-5xl" aria-hidden>
            🏆
          </span>
        </div>
        <p className="reward-celebration-title mt-5 text-2xl font-bold text-amber-300">
          ¡Logro reclamado!
        </p>
        <p className="mt-1 max-w-xs text-base text-slate-200">{title}</p>
        {amount > 0 && (
          <p className="reward-celebration-amount mt-3 text-3xl font-bold text-emerald-400">
            +{amount} 💎
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
          {i % 3 === 0 ? "💎" : i % 3 === 1 ? "✨" : "⭐"}
        </span>
      ))}
    </div>
  );
}
