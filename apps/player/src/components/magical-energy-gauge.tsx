"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge, cn } from "@repo/ui";
import { Sparkles } from "lucide-react";
import { MangaHudBar } from "@/components/manga/manga-hud-bar";
import { MANGA_COPY } from "@/lib/manga-copy";
import { getEnergyTier } from "@/lib/energy-tiers";

interface MagicalEnergyGaugeProps {
  weeklyPoints: number;
  className?: string;
}

export function MagicalEnergyGauge({ weeklyPoints, className }: MagicalEnergyGaugeProps) {
  const tier = getEnergyTier(weeklyPoints);

  return (
    <Card className={cn("manga-panel manga-panel-power h-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-lg">
          <span className="flex items-center gap-2">
            <Sparkles className="theme-icon h-5 w-5" />
            <span className="font-display tracking-wide">{MANGA_COPY.magicEnergyLabel}</span>
          </span>
          <Badge
            variant={tier.level === "high" ? "warning" : tier.level === "medium" ? "info" : "default"}
            className={cn("font-display text-xs uppercase tracking-wide", tier.pulse && "manga-energy-badge-pulse")}
          >
            {tier.emoji} {tier.label}
          </Badge>
        </CardTitle>
        <p className="text-sm text-slate-400">{tier.hint}</p>
      </CardHeader>
      <CardContent>
        <MangaHudBar
          value={tier.progress}
          label={MANGA_COPY.magicEnergyHud}
          barStyle={tier.barStyle}
          showValue={false}
          className={cn(tier.pulse && "manga-energy-high")}
        />
        <p className="mt-2 text-xs text-slate-500">
          {weeklyPoints} pts esta semana
        </p>
      </CardContent>
    </Card>
  );
}
