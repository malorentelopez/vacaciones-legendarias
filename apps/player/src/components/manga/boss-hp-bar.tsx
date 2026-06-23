"use client";

import { MangaHudBar } from "@/components/manga/manga-hud-bar";
import { MANGA_COPY } from "@/lib/manga-copy";

interface BossHpBarProps {
  completedObjectives: number;
  totalObjectives: number;
}

export function BossHpBar({ completedObjectives, totalObjectives }: BossHpBarProps) {
  const remainingHp =
    totalObjectives > 0
      ? Math.round(((totalObjectives - completedObjectives) / totalObjectives) * 100)
      : 0;

  return (
    <div className="boss-hp-panel space-y-2 rounded-xl p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-sm uppercase tracking-wide text-red-200">
          {MANGA_COPY.bossHpLabel}
        </p>
        <p className="text-xs font-medium text-slate-300">
          {completedObjectives}/{totalObjectives} {MANGA_COPY.bossObjectivesLabel}
        </p>
      </div>
      <MangaHudBar
        value={remainingHp}
        label={MANGA_COPY.bossHpHud}
        showValue={false}
        className="boss-hp-bar"
        barStyle={{
          background: "linear-gradient(90deg, #ef4444, #fb7185)",
        }}
      />
    </div>
  );
}
