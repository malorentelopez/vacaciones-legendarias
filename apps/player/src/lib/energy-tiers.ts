import type { CSSProperties } from "react";

export type EnergyLevel = "low" | "medium" | "high";

export interface EnergyTierInfo {
  level: EnergyLevel;
  label: string;
  emoji: string;
  progress: number;
  barStyle: CSSProperties;
  pulse?: boolean;
  hint: string;
}

export const ENERGY_TIER_THRESHOLDS = {
  medium: 50,
  high: 100,
} as const;

export function getEnergyTier(weeklyPoints: number): EnergyTierInfo {
  const points = Math.max(0, weeklyPoints);
  const progress = Math.min(100, points);

  if (points >= ENERGY_TIER_THRESHOLDS.high) {
    return {
      level: "high",
      label: "ALTA",
      emoji: "⚡",
      progress,
      pulse: true,
      barStyle: {
        background: "linear-gradient(90deg, #f472b6, #fb7185)",
      },
      hint: "¡Energía al máximo! Más libertad por las tardes.",
    };
  }

  if (points >= ENERGY_TIER_THRESHOLDS.medium) {
    return {
      level: "medium",
      label: "MEDIA",
      emoji: "✨",
      progress,
      barStyle: {
        background: "linear-gradient(90deg, #38bdf8, #22d3ee)",
      },
      hint: "Vas muy bien. Sigue cumpliendo misiones para subir de nivel.",
    };
  }

  return {
    level: "low",
    label: "BAJA",
    emoji: "🌙",
    progress,
    barStyle: {
      background: "linear-gradient(90deg, #64748b, #94a3b8)",
    },
    hint: "Más energía = más libertad por las tardes.",
  };
}
